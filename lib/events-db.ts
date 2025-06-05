"use client";

import {
  events as initialEvents,
  eventRegistrations as initialRegistrations,
} from "./mock-event-loader";

export type EventCategory =
  | "Garage Sale"
  | "Sports"
  | "Matches"
  | "Community Class"
  | "Volunteer Opportunity"
  | "Exhibition"
  | "Festival"
  | "Other";

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  description: string;
  maxAttendees?: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  imageUrl: string;
  date: Date;
  endDate?: Date;
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  category: EventCategory;
  organizer: {
    id: string;
    name: string;
    phone?: string;
    email: string;
  };
  isApproved: boolean;
  isFlagged?: boolean;
  flagReason?: string;
  registrationDeadline?: Date;
  isFree: boolean;
  ticketTiers?: TicketTier[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  additionalAttendees: number;
  ticketTierId?: string; // The selected ticket tier
  ticketTierName?: string; // Store the name for historical records
  ticketPrice?: number; // Store the price for historical records
  registeredAt: Date;
}

// Event data from common source
export let events: Event[] = [...initialEvents];
export const eventRegistrations: EventRegistration[] = [
  ...initialRegistrations,
];

// Function to get all events
export async function getAllEvents(): Promise<Event[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return events;
}

// Function to get approved events
export async function getApprovedEvents(): Promise<Event[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return events.filter((event) => event.isApproved);
}

// Function to get a single event by ID
export async function getEventById(id: string): Promise<Event | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));
  const event = events.find((event) => event.id === id);
  return event || null;
}

// Function to get events created by a specific user
export async function getUserEvents(userId: string): Promise<Event[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return events.filter((event) => event.organizer.id === userId);
}

// Function to create a new event
export async function createEvent(
  eventData: Omit<Event, "id" | "createdAt" | "isApproved">
): Promise<Event> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newEvent: Event = {
    ...eventData,
    id: (events.length + 1).toString(),
    isApproved: false, // Default to not approved
    createdAt: new Date(),
  };

  events.push(newEvent);

  // Import and use syncEventCreate at runtime to avoid module circular dependency
  import("./sync-events").then(({ syncEventCreate }) => {
    syncEventCreate(newEvent);
  });

  return newEvent;
}

// Function to update an event
export async function updateEvent(
  id: string,
  eventData: Partial<Omit<Event, "id" | "createdAt">>
): Promise<Event | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const eventIndex = events.findIndex((event) => event.id === id);
  if (eventIndex === -1) return null;

  const updatedEvent: Event = {
    ...events[eventIndex],
    ...eventData,
    updatedAt: new Date(),
  };

  events[eventIndex] = updatedEvent;

  // Import and use syncEventUpdate at runtime to avoid module circular dependency
  import("./sync-events").then(({ syncEventUpdate }) => {
    syncEventUpdate(updatedEvent);
  });

  return updatedEvent;
}

// Function to delete an event
export async function deleteEvent(id: string): Promise<boolean> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const initialLength = events.length;
  events = events.filter((event) => event.id !== id);

  // Import and use syncEventDelete at runtime to avoid module circular dependency
  if (initialLength > events.length) {
    import("./sync-events").then(({ syncEventDelete }) => {
      syncEventDelete(id);
    });
  }

  return events.length < initialLength;
}

// Function to approve an event (admin only)
export async function approveEvent(id: string): Promise<Event | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const eventIndex = events.findIndex((event) => event.id === id);
  if (eventIndex === -1) return null;

  events[eventIndex].isApproved = true;
  events[eventIndex].updatedAt = new Date();

  return events[eventIndex];
}

// Function to register for an event
export async function registerForEvent(
  eventId: string,
  userData: {
    userId: string;
    name: string;
    email: string;
    phone?: string;
    additionalAttendees: number;
    ticketTierId?: string;
  }
): Promise<EventRegistration> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Check if user is already registered
  const existingRegistration = eventRegistrations.find(
    (reg) => reg.eventId === eventId && reg.userId === userData.userId
  );

  if (existingRegistration) {
    throw new Error("You have already registered for this event");
  }

  // Get the event to find ticket tier details
  const event = await getEventById(eventId);
  if (!event) {
    throw new Error("Event not found");
  }

  // Find the selected ticket tier if provided
  let ticketTierName;
  let ticketPrice;

  if (userData.ticketTierId && event.ticketTiers) {
    const selectedTier = event.ticketTiers.find(
      (tier) => tier.id === userData.ticketTierId
    );
    if (selectedTier) {
      ticketTierName = selectedTier.name;
      ticketPrice = selectedTier.price;
    }
  }

  const newRegistration: EventRegistration = {
    id: (eventRegistrations.length + 1).toString(),
    eventId,
    userId: userData.userId,
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    additionalAttendees: userData.additionalAttendees,
    ticketTierId: userData.ticketTierId,
    ticketTierName,
    ticketPrice,
    registeredAt: new Date(),
  };

  eventRegistrations.push(newRegistration);
  return newRegistration;
}

// Function to get registrations for an event (for organizers/admin)
export async function getEventRegistrations(
  eventId: string
): Promise<EventRegistration[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return eventRegistrations.filter((reg) => reg.eventId === eventId);
}

// Function to check if a user is registered for an event
export async function isUserRegistered(
  eventId: string,
  userId: string
): Promise<boolean> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));
  return eventRegistrations.some(
    (reg) => reg.eventId === eventId && reg.userId === userId
  );
}

// Function to cancel an event registration
export async function cancelEventRegistration(
  eventId: string,
  userId: string
): Promise<boolean> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Find the registration
  const initialLength = eventRegistrations.length;
  const registrationIndex = eventRegistrations.findIndex(
    (reg) => reg.eventId === eventId && reg.userId === userId
  );

  if (registrationIndex === -1) {
    throw new Error("Registration not found");
  }

  // Remove the registration
  eventRegistrations.splice(registrationIndex, 1);

  return eventRegistrations.length < initialLength;
}
