"use client";

// Import types from events-db and data from server-events
import { events } from "./server-events";
import {
  Event,
  EventRegistration,
  eventRegistrations as registrations,
} from "./events-db";
import {
  NotificationService,
  NotificationTemplate,
} from "./notification-service";

// Data service functions to replace direct DB manipulation

export const EventService = {
  // GET functions
  getEvents: async (): Promise<Event[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return events;
  },

  getApprovedEvents: async (): Promise<Event[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return events.filter((event) => event.isApproved);
  },

  getEventById: async (id: string): Promise<Event | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return events.find((event) => event.id === id);
  },

  getUserEvents: async (userId: string): Promise<Event[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return events.filter((event) => event.organizer.id === userId);
  },

  getRegisteredEvents: async (userId: string): Promise<Event[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const userRegistrations = registrations.filter(
      (reg) => reg.userId === userId
    );
    const registeredEvents = userRegistrations
      .map((reg) => events.find((event) => event.id === reg.eventId))
      .filter(Boolean) as Event[];

    return registeredEvents;
  },

  searchEvents: async (query: string): Promise<Event[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const lowercaseQuery = query.toLowerCase();

    return events.filter(
      (event) =>
        event.isApproved &&
        (event.title.toLowerCase().includes(lowercaseQuery) ||
          event.description.toLowerCase().includes(lowercaseQuery) ||
          event.location.address.toLowerCase().includes(lowercaseQuery) ||
          event.category.toLowerCase().includes(lowercaseQuery))
    );
  },

  // POST/PUT/DELETE functions
  createEvent: async (
    eventData: Omit<Event, "id" | "createdAt" | "isApproved">
  ): Promise<Event> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const newEvent: Event = {
      ...eventData,
      id: String(events.length + 1),
      createdAt: new Date(),
      isApproved: false, // New events require approval
    };

    events.push(newEvent);
    return newEvent;
  },

  updateEvent: async (
    id: string,
    eventData: Partial<Event>
  ): Promise<Event> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const eventIndex = events.findIndex((event) => event.id === id);
    if (eventIndex === -1) {
      throw new Error("Event not found");
    }

    const updatedEvent = {
      ...events[eventIndex],
      ...eventData,
      updatedAt: new Date(),
    };

    events[eventIndex] = updatedEvent;

    // Get all registrations for this event
    const eventRegistrations = registrations.filter(
      (reg) => reg.eventId === id
    );

    // Notify all registered participants about the update
    if (eventRegistrations.length > 0) {
      try {
        await NotificationService.notifyEventUpdated(
          updatedEvent,
          eventRegistrations
        );

        // Reschedule reminders if the date changed
        if (eventData.date && eventData.date !== events[eventIndex].date) {
          await NotificationService.scheduleEventReminders(
            updatedEvent,
            eventRegistrations
          );
        }
      } catch (error) {
        console.error("Failed to send update notifications:", error);
      }
    }

    return updatedEvent;
  },

  deleteEvent: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const eventIndex = events.findIndex((event) => event.id === id);
    if (eventIndex === -1) {
      return false;
    }

    const eventToDelete = events[eventIndex];

    // Get all registrations before removing them
    const eventRegistrations = registrations.filter(
      (reg) => reg.eventId === id
    );

    events.splice(eventIndex, 1);

    // Also remove any registrations for this event
    const updatedRegistrations = registrations.filter(
      (reg) => reg.eventId !== id
    );
    registrations.length = 0;
    registrations.push(...updatedRegistrations);

    // Notify all registered participants about the cancellation
    if (eventRegistrations.length > 0) {
      try {
        await NotificationService.notifyEventCancelled(
          eventToDelete,
          eventRegistrations
        );
      } catch (error) {
        console.error("Failed to send cancellation notifications:", error);
      }
    }

    return true;
  },

  // Registration functions
  registerForEvent: async (
    registration: Omit<EventRegistration, "id" | "registeredAt">
  ): Promise<EventRegistration> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Extract eventId and user data to match the registerForEvent function in events-db.ts
    const { eventId, userId, name, email, phone, additionalAttendees } =
      registration;

    const event = events.find((e) => e.id === eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Call the actual database function with the correct parameters
    const registrationResult = await import("./events-db").then(
      ({ registerForEvent }) => {
        return registerForEvent(eventId, {
          userId,
          name,
          email,
          phone,
          additionalAttendees: additionalAttendees || 0,
        });
      }
    );

    try {
      // Send registration confirmation
      await NotificationService.sendRegistrationConfirmation(
        event,
        registrationResult
      );

      // Schedule a reminder notification
      const reminderDate = new Date(event.date);
      reminderDate.setDate(reminderDate.getDate() - 1);

      await NotificationService.scheduleNotification({
        recipient: {
          id: userId,
          name,
          email,
          phone,
        },
        event,
        template: NotificationTemplate.EventReminder,
        scheduledFor: reminderDate,
      });
    } catch (error) {
      console.error("Failed to send notifications:", error);
    }

    return registrationResult;
  },

  // Check if user is registered for an event
  isUserRegistered: async (
    eventId: string,
    userId: string
  ): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    return await import("./events-db").then(({ isUserRegistered }) => {
      return isUserRegistered(eventId, userId);
    });
  },

  // Cancel a registration for an event
  cancelRegistration: async (
    eventId: string,
    userId: string
  ): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const event = events.find((e) => e.id === eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Get registration details before cancelling
    const registration = registrations.find(
      (reg) => reg.eventId === eventId && reg.userId === userId
    );

    if (!registration) {
      throw new Error("Registration not found");
    }

    // Call the actual database function to cancel registration
    const result = await import("./events-db").then(
      ({ cancelEventRegistration }) => {
        return cancelEventRegistration(eventId, userId);
      }
    );

    if (result) {
      try {
        // Send cancellation confirmation
        await NotificationService.sendNotification({
          recipient: {
            id: userId,
            name: registration.name,
            email: registration.email,
            phone: registration.phone,
          },
          event,
          template: NotificationTemplate.RegistrationCancelled,
        });
      } catch (error) {
        console.error("Failed to send cancellation notification:", error);
      }
    }

    return result;
  },

  // Admin functions
  approveEvent: async (id: string): Promise<Event> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const eventIndex = events.findIndex((event) => event.id === id);
    if (eventIndex === -1) {
      throw new Error("Event not found");
    }

    const approvedEvent = {
      ...events[eventIndex],
      isApproved: true,
      updatedAt: new Date(),
    };

    events[eventIndex] = approvedEvent;

    // Send notification to event organizer
    try {
      await NotificationService.sendNotification({
        recipient: {
          id: approvedEvent.organizer.id,
          name: approvedEvent.organizer.name,
          email: approvedEvent.organizer.email,
          phone: approvedEvent.organizer.phone,
        },
        event: approvedEvent,
        template: NotificationTemplate.EventUpdated,
      });
    } catch (error) {
      console.error("Failed to send approval notification:", error);
    }

    return approvedEvent;
  },

  rejectEvent: async (id: string): Promise<Event> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const eventIndex = events.findIndex((event) => event.id === id);
    if (eventIndex === -1) {
      throw new Error("Event not found");
    }

    const rejectedEvent = {
      ...events[eventIndex],
      isApproved: false,
      updatedAt: new Date(),
    };

    events[eventIndex] = rejectedEvent;

    // Send notification to event organizer
    try {
      await NotificationService.sendNotification({
        recipient: {
          id: rejectedEvent.organizer.id,
          name: rejectedEvent.organizer.name,
          email: rejectedEvent.organizer.email,
          phone: rejectedEvent.organizer.phone,
        },
        event: rejectedEvent,
        template: NotificationTemplate.EventUpdated, // You could create a specific rejection template
      });
    } catch (error) {
      console.error("Failed to send rejection notification:", error);
    }

    return rejectedEvent;
  },

  // Additional admin functions

  // Flag inappropriate content
  flagEvent: async (id: string, reason: string): Promise<Event> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const eventIndex = events.findIndex((event) => event.id === id);
    if (eventIndex === -1) {
      throw new Error("Event not found");
    }

    const flaggedEvent = {
      ...events[eventIndex],
      isFlagged: true,
      flagReason: reason,
      updatedAt: new Date(),
    };

    events[eventIndex] = flaggedEvent;

    // Notify the organizer
    try {
      await NotificationService.sendNotification({
        recipient: {
          id: flaggedEvent.organizer.id,
          name: flaggedEvent.organizer.name,
          email: flaggedEvent.organizer.email,
          phone: flaggedEvent.organizer.phone,
        },
        event: flaggedEvent,
        template: NotificationTemplate.EventFlagged,
      });
    } catch (error) {
      console.error("Failed to send flag notification:", error);
    }

    return flaggedEvent;
  },

  // Remove flag from event
  unflagEvent: async (id: string): Promise<Event> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const eventIndex = events.findIndex((event) => event.id === id);
    if (eventIndex === -1) {
      throw new Error("Event not found");
    }

    const unflaggedEvent = {
      ...events[eventIndex],
      isFlagged: false,
      flagReason: undefined,
      updatedAt: new Date(),
    };

    events[eventIndex] = unflaggedEvent;

    // Notify the organizer that the flag has been removed
    try {
      await NotificationService.sendNotification({
        recipient: {
          id: unflaggedEvent.organizer.id,
          name: unflaggedEvent.organizer.name,
          email: unflaggedEvent.organizer.email,
          phone: unflaggedEvent.organizer.phone,
        },
        event: unflaggedEvent,
        template: NotificationTemplate.EventUnflagged,
      });
    } catch (error) {
      console.error("Failed to send unflag notification:", error);
    }

    return unflaggedEvent;
  },

  // Get events by user
  getEventsByUser: async (userId: string): Promise<Event[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return events.filter((event) => event.organizer.id === userId);
  },

  // Assign verified organizer status
  setUserVerifiedStatus: async (
    userId: string,
    isVerified: boolean
  ): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // This would update the user in a real database
    try {
      // Import users from mock-db
      const { users } = await import("./mock-db");

      const userIndex = users.findIndex((u) => u.id === userId);
      if (userIndex === -1) {
        return false;
      }

      // Add isVerifiedOrganizer field to the user
      users[userIndex] = {
        ...users[userIndex],
        isVerifiedOrganizer: isVerified,
      };

      return true;
    } catch (error) {
      console.error("Failed to update user verified status:", error);
      return false;
    }
  },

  // Ban user
  banUser: async (userId: string, reason: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      // Import users from mock-db
      const { users } = await import("./mock-db");

      const userIndex = users.findIndex((u) => u.id === userId);
      if (userIndex === -1) {
        return false;
      }

      // Add banned status to the user
      users[userIndex] = {
        ...users[userIndex],
        isBanned: true,
        banReason: reason,
        bannedAt: new Date(),
      };

      // Send notification to the banned user
      // In a real app, you might want to inform the user via email

      return true;
    } catch (error) {
      console.error("Failed to ban user:", error);
      return false;
    }
  },

  // Unban user
  unbanUser: async (userId: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      // Import users from mock-db
      const { users } = await import("./mock-db");

      const userIndex = users.findIndex((u) => u.id === userId);
      if (userIndex === -1) {
        return false;
      }

      // Remove ban status from the user
      users[userIndex] = {
        ...users[userIndex],
        isBanned: false,
        banReason: undefined,
        bannedAt: undefined,
      };

      return true;
    } catch (error) {
      console.error("Failed to unban user:", error);
      return false;
    }
  },
};
