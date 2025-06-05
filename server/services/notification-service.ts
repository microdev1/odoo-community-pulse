"use server";

import { db, schema } from "../db";
import { createId } from "@paralleldrive/cuid2";
import { eq, and, gte, lt } from "drizzle-orm";

// Send a notification (email, SMS, or WhatsApp)
export async function sendNotification({
  userId,
  eventId,
  type,
  via,
  content,
}: {
  userId: string;
  eventId: string;
  type: "reminder" | "update" | "cancellation";
  via: "email" | "sms" | "whatsapp";
  content: string;
}) {
  console.log(
    `Preparing to send ${via} notification to user ${userId} for event ${eventId}`
  );

  // Get user and event information
  const users = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId));
  const events = await db
    .select()
    .from(schema.events)
    .where(eq(schema.events.id, eventId));

  if (users.length === 0) {
    console.error(`User ${userId} not found for notification`);
    return { success: false, error: "User not found" };
  }

  if (events.length === 0) {
    console.error(`Event ${eventId} not found for notification`);
    return { success: false, error: "Event not found" };
  }

  let success = false;

  // Record the notification in the database
  const notificationId = createId();
  await db.insert(schema.notifications).values({
    id: notificationId,
    userId,
    eventId,
    type,
    sentVia: via,
    isSuccess: success,
  });

  return {
    success,
    notificationId,
  };
}

// Send event reminders to all registered users (would be called by a scheduled job)
export async function sendEventReminders() {
  // Get all events happening tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  const events = await db
    .select()
    .from(schema.events)
    .where(
      and(
        eq(schema.events.isApproved, true),
        eq(schema.events.isRejected, false),
        gte(schema.events.date, tomorrow.toISOString()),
        lt(schema.events.date, dayAfterTomorrow.toISOString())
      )
    );

  // For each event, get all registrations and send reminders
  for (const event of events) {
    const registrations = await db
      .select({
        registration: schema.registrations,
        user: schema.users,
      })
      .from(schema.registrations)
      .where(eq(schema.registrations.eventId, event.id))
      .innerJoin(
        schema.users,
        eq(schema.registrations.userId, schema.users.id)
      );

    for (const registration of registrations) {
      // Check if a reminder has already been sent
      const existingNotifications = await db
        .select()
        .from(schema.notifications)
        .where(
          and(
            eq(schema.notifications.userId, registration.user.id),
            eq(schema.notifications.eventId, event.id),
            eq(schema.notifications.type, "reminder")
          )
        );

      // If no reminder has been sent yet, send one
      if (existingNotifications.length === 0) {
        await sendNotification({
          userId: registration.user.id,
          eventId: event.id,
          type: "reminder",
          via: "email", // Default to email
          content: `Reminder: The event "${event.title}" is happening tomorrow!`,
        });
      }
    }
  }

  return {
    success: true,
    message: "Event reminders sent",
  };
}

// Send event update notifications to all registered users
export async function sendEventUpdateNotifications(
  eventId: string,
  updateMessage: string
) {
  const registrations = await db
    .select()
    .from(schema.registrations)
    .where(eq(schema.registrations.eventId, eventId));

  for (const registration of registrations) {
    await sendNotification({
      userId: registration.userId,
      eventId,
      type: "update",
      via: "email", // Default to email
      content: updateMessage,
    });
  }

  return {
    success: true,
    message: "Event update notifications sent",
  };
}

// Send event cancellation notifications to all registered users
export async function sendEventCancellationNotifications(eventId: string) {
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
  const registrations = await db
    .select()
    .from(schema.registrations)
    .where(eq(schema.registrations.eventId, eventId));

  for (const registration of registrations) {
    await sendNotification({
      userId: registration.userId,
      eventId,
      type: "cancellation",
      via: "email", // Default to email, could be configured per user
      content: `The event "${event.title}" has been cancelled.`,
    });
  }

  return {
    success: true,
    message: "Event cancellation notifications sent",
  };
}
