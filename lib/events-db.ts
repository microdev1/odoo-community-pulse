"use client";

export type EventCategory =
  | "Garage Sale"
  | "Sports"
  | "Matches"
  | "Community Class"
  | "Volunteer Opportunity"
  | "Exhibition"
  | "Festival"
  | "Other";

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
  registrationDeadline?: Date;
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
  registeredAt: Date;
}

// Mock event data
export let events: Event[] = [
  {
    id: "1",
    title: "Community Cleanup Drive",
    description:
      "Join us for a day of community cleanup at Central Park. Together we can make our neighborhood cleaner and more beautiful. Bring gloves and wear comfortable clothes. Trash bags and some tools will be provided.",
    shortDescription: "Help clean up our local park",
    imageUrl:
      "https://images.unsplash.com/photo-1561144257-e32e8efc6c4f?w=800&q=80",
    date: new Date("2025-05-25T09:00:00"),
    endDate: new Date("2025-05-25T12:00:00"),
    location: {
      address: "Central Park, Downtown",
      latitude: 40.785091,
      longitude: -73.968285,
    },
    category: "Volunteer Opportunity",
    organizer: {
      id: "1",
      name: "Admin",
      email: "admin@example.com",
    },
    isApproved: true,
    registrationDeadline: new Date("2025-05-24T18:00:00"),
    createdAt: new Date("2025-04-01"),
  },
  {
    id: "2",
    title: "Summer Garage Sale",
    description:
      "Community-wide garage sale with great deals on household items, clothes, toys, and more. Come find some treasures!",
    shortDescription: "Find great deals at our community sale",
    imageUrl:
      "https://images.unsplash.com/photo-1563127941-ea3d43fa95c8?w=800&q=80",
    date: new Date("2025-06-05T08:00:00"),
    endDate: new Date("2025-06-05T16:00:00"),
    location: {
      address: "123 Maple Street",
      latitude: 40.712776,
      longitude: -74.005974,
    },
    category: "Garage Sale",
    organizer: {
      id: "2",
      name: "User1",
      phone: "+1234567890",
      email: "user1@example.com",
    },
    isApproved: true,
    createdAt: new Date("2025-05-10"),
  },
  {
    id: "3",
    title: "Neighborhood Soccer Match",
    description:
      "Friendly soccer match between the east and west side neighbors. All skill levels welcome. Refreshments will be provided after the game.",
    shortDescription: "Join our friendly neighborhood match",
    imageUrl:
      "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800&q=80",
    date: new Date("2025-05-30T16:00:00"),
    endDate: new Date("2025-05-30T18:00:00"),
    location: {
      address: "Community Field, Park Ave",
      latitude: 40.73061,
      longitude: -73.935242,
    },
    category: "Matches",
    organizer: {
      id: "2",
      name: "User1",
      phone: "+1234567890",
      email: "user1@example.com",
    },
    isApproved: true,
    registrationDeadline: new Date("2025-05-29T20:00:00"),
    createdAt: new Date("2025-05-15"),
  },
  {
    id: "4",
    title: "Art in the Park Exhibition",
    description:
      "Local artists showcase their work in our community park. Various art forms including paintings, sculptures, and photography will be on display.",
    shortDescription: "Discover local art talents",
    imageUrl:
      "https://images.unsplash.com/photo-1501084817091-a4f3d1d19e07?w=800&q=80",
    date: new Date("2025-06-15T10:00:00"),
    endDate: new Date("2025-06-15T17:00:00"),
    location: {
      address: "Memorial Park Gallery",
      latitude: 40.753182,
      longitude: -73.982253,
    },
    category: "Exhibition",
    organizer: {
      id: "1",
      name: "Admin",
      email: "admin@example.com",
    },
    isApproved: true,
    createdAt: new Date("2025-05-05"),
  },
  {
    id: "5",
    title: "Morning Yoga Class",
    description:
      "Start your day with relaxing yoga in the park. This class is suitable for all levels. Please bring your own mat and water bottle.",
    shortDescription: "Relaxing morning yoga session",
    imageUrl:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    date: new Date("2025-05-22T07:30:00"),
    endDate: new Date("2025-05-22T08:30:00"),
    location: {
      address: "Sunrise Park, East End",
      latitude: 40.712776,
      longitude: -74.005974,
    },
    category: "Community Class",
    organizer: {
      id: "2",
      name: "User1",
      phone: "+1234567890",
      email: "user1@example.com",
    },
    isApproved: false,
    registrationDeadline: new Date("2025-05-21T20:00:00"),
    createdAt: new Date("2025-05-10"),
  },
];

export const eventRegistrations: EventRegistration[] = [
  {
    id: "1",
    eventId: "1",
    userId: "2",
    name: "User1",
    email: "user1@example.com",
    phone: "+1234567890",
    additionalAttendees: 2,
    registeredAt: new Date("2025-05-01"),
  },
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

  const newRegistration: EventRegistration = {
    id: (eventRegistrations.length + 1).toString(),
    eventId,
    userId: userData.userId,
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    additionalAttendees: userData.additionalAttendees,
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
