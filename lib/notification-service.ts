"use client";

import { Event, EventRegistration } from "./events-db";

/**
 * Notification types supported by the system
 */
export enum NotificationType {
  Email = "email",
  SMS = "sms",
  WhatsApp = "whatsapp",
}

/**
 * Notification templates for different events
 */
export enum NotificationTemplate {
  EventReminder = "event_reminder",
  EventUpdated = "event_updated",
  EventCancelled = "event_cancelled",
  RegistrationConfirmation = "registration_confirmation",
  RegistrationCancelled = "registration_cancelled",
  EventFlagged = "event_flagged",
}

/**
 * Interface for notification data
 */
export interface NotificationData {
  recipient: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  event: Event;
  template: NotificationTemplate;
  scheduledFor?: Date;
}

/**
 * Mock notification service for the Community Pulse app
 * In a real application, this would connect to actual email/SMS/WhatsApp services
 */
export class NotificationService {
  /**
   * Send a notification immediately
   */
  static async sendNotification(
    data: NotificationData,
    type: NotificationType = NotificationType.Email
  ): Promise<boolean> {
    // In a real app, you would integrate with an actual notification service
    console.log(`Sending ${type} notification to ${data.recipient.name}:`);

    let subject = "";
    let message = "";

    switch (data.template) {
      case NotificationTemplate.EventReminder:
        subject = `Reminder: ${data.event.title} is tomorrow!`;
        message = `Don't forget to attend ${data.event.title} tomorrow at ${new Date(data.event.date).toLocaleTimeString()} at ${data.event.location.address}.`;
        break;

      case NotificationTemplate.EventUpdated:
        subject = `Event Updated: ${data.event.title}`;
        message = `The event ${data.event.title} you're registered for has been updated. Please check the event page for details.`;
        break;

      case NotificationTemplate.EventCancelled:
        subject = `Event Cancelled: ${data.event.title}`;
        message = `We're sorry to inform you that the event ${data.event.title} has been cancelled.`;
        break;

      case NotificationTemplate.RegistrationConfirmation:
        subject = `Registration Confirmed: ${data.event.title}`;
        message = `Your registration for ${data.event.title} on ${new Date(data.event.date).toLocaleDateString()} has been confirmed. Thank you!`;
        break;

      case NotificationTemplate.EventFlagged:
        subject = `Event Flagged: ${data.event.title}`;
        message = `Your event ${data.event.title} has been flagged by an administrator. Please review our community guidelines and contact support for more information.`;
        break;

      default:
        subject = `Community Pulse: ${data.event.title}`;
        message = `Notification about ${data.event.title}`;
    }

    // Log the notification details
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);

    // Mock a successful notification
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Notification sent successfully");
        resolve(true);
      }, 500);
    });
  }

  /**
   * Schedule a notification for a future date
   */
  static async scheduleNotification(
    data: NotificationData,
    type: NotificationType = NotificationType.Email
  ): Promise<boolean> {
    if (!data.scheduledFor) {
      throw new Error(
        "scheduledFor date is required for scheduling notifications"
      );
    }

    // In a real app, this would add the notification to a queue or scheduler
    console.log(
      `Scheduling ${type} notification for ${data.recipient.name} at ${data.scheduledFor.toLocaleString()}`
    );

    // Mock a successful scheduling
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Notification scheduled successfully");
        resolve(true);
      }, 300);
    });
  }

  /**
   * Schedule reminder notifications for all participants of an event
   * This would typically be called when an event is created or updated
   */
  static async scheduleEventReminders(
    event: Event,
    registrations: EventRegistration[]
  ): Promise<void> {
    // Calculate the reminder date (1 day before event)
    const reminderDate = new Date(event.date);
    reminderDate.setDate(reminderDate.getDate() - 1);

    // Schedule reminders for all registered participants
    for (const reg of registrations) {
      await NotificationService.scheduleNotification(
        {
          recipient: {
            id: reg.userId,
            name: reg.name,
            email: reg.email,
            phone: reg.phone,
          },
          event,
          template: NotificationTemplate.EventReminder,
          scheduledFor: reminderDate,
        },
        NotificationType.Email
      );
    }
  }

  /**
   * Send notifications to all participants about event updates
   * This would typically be called when an event is updated
   */
  static async notifyEventUpdated(
    event: Event,
    registrations: EventRegistration[]
  ): Promise<void> {
    // Send notifications to all registered participants
    for (const reg of registrations) {
      await NotificationService.sendNotification(
        {
          recipient: {
            id: reg.userId,
            name: reg.name,
            email: reg.email,
            phone: reg.phone,
          },
          event,
          template: NotificationTemplate.EventUpdated,
        },
        NotificationType.Email
      );
    }
  }

  /**
   * Send notifications to all participants about event cancellation
   * This would typically be called when an event is deleted
   */
  static async notifyEventCancelled(
    event: Event,
    registrations: EventRegistration[]
  ): Promise<void> {
    // Send notifications to all registered participants
    for (const reg of registrations) {
      await NotificationService.sendNotification(
        {
          recipient: {
            id: reg.userId,
            name: reg.name,
            email: reg.email,
            phone: reg.phone,
          },
          event,
          template: NotificationTemplate.EventCancelled,
        },
        NotificationType.Email
      );
    }
  }

  /**
   * Send a registration confirmation notification
   * This would typically be called when a user registers for an event
   */
  static async sendRegistrationConfirmation(
    event: Event,
    registration: EventRegistration
  ): Promise<void> {
    await NotificationService.sendNotification(
      {
        recipient: {
          id: registration.userId,
          name: registration.name,
          email: registration.email,
          phone: registration.phone,
        },
        event,
        template: NotificationTemplate.RegistrationConfirmation,
      },
      NotificationType.Email
    );
  }
}
