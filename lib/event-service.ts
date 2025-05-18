"use client";

// Import types from events-db and data from server-events
import { events } from "./server-events";
import {
  Event,
  EventRegistration,
  eventRegistrations as registrations,
} from "./events-db";

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
    return updatedEvent;
  },

  deleteEvent: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const eventIndex = events.findIndex((event) => event.id === id);
    if (eventIndex === -1) {
      return false;
    }

    events.splice(eventIndex, 1);

    // Also remove any registrations for this event
    const updatedRegistrations = registrations.filter(
      (reg) => reg.eventId !== id
    );
    registrations.length = 0;
    registrations.push(...updatedRegistrations);

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

    // Call the actual database function with the correct parameters
    return import("./events-db").then(({ registerForEvent }) => {
      return registerForEvent(eventId, {
        userId,
        name,
        email,
        phone,
        additionalAttendees: additionalAttendees || 0,
      });
    });
  },

  // Admin functions
  approveEvent: async (id: string): Promise<Event> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const eventIndex = events.findIndex((event) => event.id === id);
    if (eventIndex === -1) {
      throw new Error("Event not found");
    }

    events[eventIndex] = {
      ...events[eventIndex],
      isApproved: true,
      updatedAt: new Date(),
    };

    return events[eventIndex];
  },

  rejectEvent: async (id: string): Promise<Event> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const eventIndex = events.findIndex((event) => event.id === id);
    if (eventIndex === -1) {
      throw new Error("Event not found");
    }

    events[eventIndex] = {
      ...events[eventIndex],
      isApproved: false,
      updatedAt: new Date(),
    };

    return events[eventIndex];
  },
};
