"use server";

import { db, schema } from "../db";
import { eq, and, like, gte, lte, or, desc, isNull } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export class ServerEventService {
  // Get all events (public)
  static async getAllEvents() {
    const events = await db
      .select()
      .from(schema.events)
      .where(
        and(
          eq(schema.events.isApproved, true),
          eq(schema.events.isRejected, false)
        )
      )
      .orderBy(desc(schema.events.date));

    // For each event, get the organizer
    const eventsWithOrganizer = await Promise.all(
      events.map(async (event) => {
        const organizers = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, event.organizerId));

        return {
          ...event,
          organizer: organizers[0] || null,
        };
      })
    );

    return eventsWithOrganizer;
  }

  // Get event by ID (public)
  static async getEventById(id: string) {
    const events = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.id, id));

    if (events.length === 0) {
      return null;
    }

    const event = events[0];

    // Get the organizer
    const organizers = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, event.organizerId));

    // Get the ticket tiers
    const ticketTiers = await db
      .select()
      .from(schema.ticketTiers)
      .where(eq(schema.ticketTiers.eventId, id));

    return {
      ...event,
      organizer: organizers[0] || null,
      ticketTiers,
    };
  }

  // Search events (public)
  static async searchEvents({
    query,
    category,
    startDate,
    endDate,
  }: {
    query?: string;
    category?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    let conditions = [
      eq(schema.events.isApproved, true),
      eq(schema.events.isRejected, false),
    ];

    // Add search query condition if provided
    if (query) {
      conditions.push(
        or(
          like(schema.events.title, `%${query}%`),
          like(schema.events.description, `%${query}%`),
          like(schema.events.shortDescription || "", `%${query}%`),
          like(schema.events.locationAddress, `%${query}%`)
        )
      );
    }

    // Add category condition if provided
    if (category) {
      conditions.push(eq(schema.events.category, category));
    }

    // Add date range conditions if provided
    if (startDate) {
      conditions.push(gte(schema.events.date, startDate.toISOString()));
    }

    if (endDate) {
      conditions.push(lte(schema.events.date, endDate.toISOString()));
    }

    const events = await db
      .select()
      .from(schema.events)
      .where(and(...conditions))
      .orderBy(desc(schema.events.date));

    // For each event, get the organizer
    const eventsWithOrganizer = await Promise.all(
      events.map(async (event) => {
        const organizers = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, event.organizerId));

        return {
          ...event,
          organizer: organizers[0] || null,
        };
      })
    );

    return eventsWithOrganizer;
  }

  // Create a new event
  static async createEvent(eventData: {
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
    category: string;
    organizer: {
      id: string;
      name: string;
      phone?: string;
      email: string;
    };
    isFree: boolean;
    ticketTiers?: Array<{
      id: string;
      name: string;
      price: number;
      description: string;
    }>;
    registrationDeadline?: Date;
  }) {
    // Create the event ID
    const eventId = createId();

    // Insert the event
    await db.insert(schema.events).values({
      id: eventId,
      title: eventData.title,
      description: eventData.description,
      shortDescription: eventData.shortDescription || null,
      imageUrl: eventData.imageUrl,
      date: eventData.date.toISOString(),
      endDate: eventData.endDate ? eventData.endDate.toISOString() : null,
      locationAddress: eventData.location.address,
      locationLatitude: eventData.location.latitude || null,
      locationLongitude: eventData.location.longitude || null,
      category: eventData.category,
      organizerId: eventData.organizer.id,
      isFree: eventData.isFree,
      registrationDeadline: eventData.registrationDeadline
        ? eventData.registrationDeadline.toISOString()
        : null,
      // New events require approval by default
      isApproved: false,
      isRejected: false,
    });

    // Insert ticket tiers if provided
    if (eventData.ticketTiers && eventData.ticketTiers.length > 0) {
      const ticketTiersData = eventData.ticketTiers.map((tier) => ({
        id: tier.id || createId(),
        eventId,
        name: tier.name,
        price: tier.price,
        description: tier.description,
      }));

      await db.insert(schema.ticketTiers).values(ticketTiersData);
    }

    return {
      success: true,
      message: "Event created successfully and pending approval",
      eventId,
    };
  }

  // Update an existing event
  static async updateEvent(
    eventId: string,
    eventData: {
      title?: string;
      description?: string;
      shortDescription?: string;
      imageUrl?: string;
      date?: Date;
      endDate?: Date;
      location?: {
        address: string;
        latitude?: number;
        longitude?: number;
      };
      category?: string;
      isFree?: boolean;
      ticketTiers?: Array<{
        id: string;
        name: string;
        price: number;
        description: string;
      }>;
      registrationDeadline?: Date;
    }
  ) {
    // Get the current event to check ownership
    const events = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.id, eventId));

    if (events.length === 0) {
      return {
        success: false,
        message: "Event not found",
      };
    }

    const event = events[0];

    // Prepare update data
    const updateData: any = {};

    if (eventData.title) updateData.title = eventData.title;
    if (eventData.description) updateData.description = eventData.description;
    if (eventData.shortDescription !== undefined)
      updateData.shortDescription = eventData.shortDescription;
    if (eventData.imageUrl) updateData.imageUrl = eventData.imageUrl;
    if (eventData.date) updateData.date = eventData.date.toISOString();
    if (eventData.endDate !== undefined)
      updateData.endDate = eventData.endDate
        ? eventData.endDate.toISOString()
        : null;
    if (eventData.location) {
      updateData.locationAddress = eventData.location.address;
      updateData.locationLatitude = eventData.location.latitude || null;
      updateData.locationLongitude = eventData.location.longitude || null;
    }
    if (eventData.category) updateData.category = eventData.category;
    if (eventData.isFree !== undefined) updateData.isFree = eventData.isFree;
    if (eventData.registrationDeadline !== undefined)
      updateData.registrationDeadline = eventData.registrationDeadline
        ? eventData.registrationDeadline.toISOString()
        : null;

    // Set event back to pending approval when updated
    updateData.isApproved = false;
    updateData.isRejected = false;

    // Update the event
    await db
      .update(schema.events)
      .set(updateData)
      .where(eq(schema.events.id, eventId));

    // Update ticket tiers if provided
    if (eventData.ticketTiers && eventData.ticketTiers.length > 0) {
      // Delete existing ticket tiers
      await db
        .delete(schema.ticketTiers)
        .where(eq(schema.ticketTiers.eventId, eventId));

      // Insert new ticket tiers
      const ticketTiersData = eventData.ticketTiers.map((tier) => ({
        id: tier.id || createId(),
        eventId,
        name: tier.name,
        price: tier.price,
        description: tier.description,
      }));

      await db.insert(schema.ticketTiers).values(ticketTiersData);
    }

    return {
      success: true,
      message: "Event updated successfully and pending approval",
      eventId,
    };
  }

  // Delete an event
  static async deleteEvent(eventId: string) {
    // Get the current event to check ownership
    const events = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.id, eventId));

    if (events.length === 0) {
      return {
        success: false,
        message: "Event not found",
      };
    }

    // Delete the event (cascade will handle related records)
    await db.delete(schema.events).where(eq(schema.events.id, eventId));

    return {
      success: true,
      message: "Event deleted successfully",
    };
  }

  // Get events by user
  static async getUserEvents(userId: string) {
    return await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.organizerId, userId))
      .orderBy(desc(schema.events.date));
  }

  // Get registered events for a user
  static async getRegisteredEvents(userId: string) {
    const registrations = await db
      .select()
      .from(schema.registrations)
      .where(eq(schema.registrations.userId, userId))
      .orderBy(desc(schema.registrations.createdAt || ""));

    // For each registration, get the event and organizer details
    const registeredEvents = await Promise.all(
      registrations.map(async (registration) => {
        const events = await db
          .select()
          .from(schema.events)
          .where(eq(schema.events.id, registration.eventId));

        if (events.length === 0) {
          return null;
        }

        const event = events[0];

        const organizers = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, event.organizerId));

        return {
          ...event,
          organizer: organizers[0] || null,
          registrationId: registration.id,
          registrationDate: registration.createdAt,
          additionalAttendees: registration.additionalAttendees,
        };
      })
    );

    // Filter out any null entries (where the event no longer exists)
    return registeredEvents.filter(Boolean);
  }

  // Register for an event
  static async registerForEvent(registrationData: {
    eventId: string;
    userId: string;
    name: string;
    email: string;
    phone?: string;
    additionalAttendees: number;
    ticketTierId?: string;
  }) {
    // Check if the event exists and is approved
    const events = await db
      .select()
      .from(schema.events)
      .where(
        and(
          eq(schema.events.id, registrationData.eventId),
          eq(schema.events.isApproved, true),
          eq(schema.events.isRejected, false)
        )
      );

    if (events.length === 0) {
      return {
        success: false,
        message: "Event not found or not approved",
      };
    }

    const event = events[0];

    // Check if registration deadline has passed
    if (
      event.registrationDeadline &&
      new Date(event.registrationDeadline) < new Date()
    ) {
      return {
        success: false,
        message: "Registration deadline has passed",
      };
    }

    // Check if user is already registered
    const existingRegistrations = await db
      .select()
      .from(schema.registrations)
      .where(
        and(
          eq(schema.registrations.eventId, registrationData.eventId),
          eq(schema.registrations.userId, registrationData.userId)
        )
      );

    if (existingRegistrations.length > 0) {
      return {
        success: false,
        message: "You are already registered for this event",
      };
    }

    // Create registration ID
    const registrationId = createId();

    // Insert registration
    await db.insert(schema.registrations).values({
      id: registrationId,
      eventId: registrationData.eventId,
      userId: registrationData.userId,
      name: registrationData.name,
      email: registrationData.email,
      phone: registrationData.phone || null,
      additionalAttendees: registrationData.additionalAttendees,
      ticketTierId: registrationData.ticketTierId || null,
    });

    return {
      success: true,
      message: "Registration successful",
      registrationId,
    };
  }

  // Check if user is registered for an event
  static async isUserRegistered(eventId: string, userId: string) {
    const registrations = await db
      .select()
      .from(schema.registrations)
      .where(
        and(
          eq(schema.registrations.eventId, eventId),
          eq(schema.registrations.userId, userId)
        )
      );

    return {
      isRegistered: registrations.length > 0,
      registration: registrations[0] || null,
    };
  }

  // Cancel registration for an event
  static async cancelRegistration(eventId: string, userId: string) {
    // Check if registration exists
    const registrations = await db
      .select()
      .from(schema.registrations)
      .where(
        and(
          eq(schema.registrations.eventId, eventId),
          eq(schema.registrations.userId, userId)
        )
      );

    if (registrations.length === 0) {
      return {
        success: false,
        message: "Registration not found",
      };
    }

    // Delete the registration
    await db
      .delete(schema.registrations)
      .where(
        and(
          eq(schema.registrations.eventId, eventId),
          eq(schema.registrations.userId, userId)
        )
      );

    return {
      success: true,
      message: "Registration cancelled successfully",
    };
  }

  // Admin: Approve an event
  static async approveEvent(eventId: string) {
    // Check if the event exists
    const events = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.id, eventId));

    if (events.length === 0) {
      return {
        success: false,
        message: "Event not found",
      };
    }

    // Update event status
    await db
      .update(schema.events)
      .set({
        isApproved: true,
        isRejected: false,
      })
      .where(eq(schema.events.id, eventId));

    return {
      success: true,
      message: "Event approved successfully",
    };
  }

  // Admin: Reject an event
  static async rejectEvent(eventId: string) {
    // Check if the event exists
    const events = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.id, eventId));

    if (events.length === 0) {
      return {
        success: false,
        message: "Event not found",
      };
    }

    // Update event status
    await db
      .update(schema.events)
      .set({
        isApproved: false,
        isRejected: true,
      })
      .where(eq(schema.events.id, eventId));

    return {
      success: true,
      message: "Event rejected successfully",
    };
  }
}
