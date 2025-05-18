// Server-side event data functions
// This file does NOT use "use client" directive

// Import only the types from events-db
import type { Event, EventRegistration } from "./events-db";
// Import our common data source
import {
  events as initialEvents,
  eventRegistrations as initialRegistrations,
} from "./mock-event-loader";

// Using 'export let' for events instead of 'export const' so it can be modified by sync functions
export const events: Event[] = [...initialEvents];
export const eventRegistrations: EventRegistration[] = [
  ...initialRegistrations,
];

// Server-side function to get approved events
export async function getApprovedEvents(): Promise<Event[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return events.filter((event) => event.isApproved);
}

// Server-side function to get a single event by ID
export async function getEventById(id: string): Promise<Event | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));
  const event = events.find((event) => event.id === id);
  return event || null;
}

// Server-side function to get all events
export async function getAllEvents(): Promise<Event[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return events;
}

// Server-side function to get events created by a specific user
export async function getUserEvents(userId: string): Promise<Event[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return events.filter((event) => event.organizer.id === userId);
}

// Server-side function to get registrations for an event
export async function getEventRegistrations(
  eventId: string
): Promise<EventRegistration[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return eventRegistrations.filter((reg) => reg.eventId === eventId);
}

// Type declarations are already imported above
