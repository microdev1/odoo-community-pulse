"use server";

// Import types from events-db but not the client-side data
import type { Event, EventRegistration } from "@/lib/events-db";

// Import server-side events data
import { events } from "@/lib/server-events";

// Maintain a server-side registration array
const eventRegistrations: EventRegistration[] = [];

// Server-side implementation of the EventService
export const ServerEventService = {
  // GET functions
  getEvents: async (): Promise<Event[]> => {
    // No need to simulate delay on server
    return events;
  },

  getApprovedEvents: async (): Promise<Event[]> => {
    return events.filter((event) => event.isApproved);
  },

  getEventById: async (id: string): Promise<Event | undefined> => {
    return events.find((event) => event.id === id);
  },

  getUserEvents: async (userId: string): Promise<Event[]> => {
    return events.filter((event) => event.organizer.id === userId);
  },

  getRegisteredEvents: async (userId: string): Promise<Event[]> => {
    const userRegistrations = eventRegistrations.filter(
      (reg) => reg.userId === userId
    );
    const registeredEvents = userRegistrations
      .map((reg) => events.find((event) => event.id === reg.eventId))
      .filter(Boolean) as Event[];

    return registeredEvents;
  },

  searchEvents: async (
    query: string,
    options?: {
      category?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<Event[]> => {
    const lowercaseQuery = query.toLowerCase();
    let filteredEvents = events.filter(
      (event) =>
        event.isApproved &&
        (event.title.toLowerCase().includes(lowercaseQuery) ||
          event.description.toLowerCase().includes(lowercaseQuery) ||
          event.location.address.toLowerCase().includes(lowercaseQuery) ||
          event.category.toLowerCase().includes(lowercaseQuery))
    );

    // Filter by category if provided
    if (options?.category) {
      filteredEvents = filteredEvents.filter(
        (event) => event.category === options.category
      );
    }

    // Filter by date range if provided
    if (options?.startDate) {
      filteredEvents = filteredEvents.filter(
        (event) => new Date(event.date) >= options.startDate
      );
    }

    if (options?.endDate) {
      filteredEvents = filteredEvents.filter(
        (event) => new Date(event.date) <= options.endDate
      );
    }

    return filteredEvents;
  },

  // POST/PUT/DELETE functions
  createEvent: async (
    eventData: Omit<Event, "id" | "createdAt" | "isApproved">
  ): Promise<Event> => {
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
    return updatedEvent;
  },

  deleteEvent: async (id: string): Promise<boolean> => {
    const eventIndex = events.findIndex((event) => event.id === id);
    if (eventIndex === -1) {
      return false;
    }

    events.splice(eventIndex, 1);

    // Also remove any registrations for this event
    const updatedRegistrations = eventRegistrations.filter(
      (reg) => reg.eventId !== id
    );
    eventRegistrations.length = 0;
    eventRegistrations.push(...updatedRegistrations);

    return true;
  },

  // Registration functions
  registerForEvent: async (
    registration: Omit<EventRegistration, "id" | "registeredAt">
  ): Promise<EventRegistration> => {
    const { eventId, userId } = registration;

    const event = events.find((e) => e.id === eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if user is already registered
    const existingRegistration = eventRegistrations.find(
      (reg) => reg.eventId === eventId && reg.userId === userId
    );

    if (existingRegistration) {
      throw new Error("You have already registered for this event");
    }

    const newRegistration: EventRegistration = {
      id: String(eventRegistrations.length + 1),
      ...registration,
      registeredAt: new Date(),
    };

    eventRegistrations.push(newRegistration);
    return newRegistration;
  },

  // Check if user is registered for an event
  isUserRegistered: async (
    eventId: string,
    userId: string
  ): Promise<boolean> => {
    return eventRegistrations.some(
      (reg) => reg.eventId === eventId && reg.userId === userId
    );
  },

  // Cancel a registration for an event
  cancelRegistration: async (
    eventId: string,
    userId: string
  ): Promise<boolean> => {
    const registrationIndex = eventRegistrations.findIndex(
      (reg) => reg.eventId === eventId && reg.userId === userId
    );

    if (registrationIndex === -1) {
      return false;
    }

    eventRegistrations.splice(registrationIndex, 1);
    return true;
  },

  // Admin functions
  approveEvent: async (id: string): Promise<Event> => {
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
    return approvedEvent;
  },

  rejectEvent: async (id: string): Promise<Event> => {
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
    return rejectedEvent;
  },
};
