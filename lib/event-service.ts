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
};
