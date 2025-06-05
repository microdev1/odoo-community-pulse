"use client";

import { trpc } from "./trpc";

export function useNotificationService() {
  // Send reminders for events happening tomorrow
  const sendEventReminders = async () => {
    const response = await trpc.notification.sendEventReminders.mutate();
    return response;
  };

  // Send update notifications for a specific event
  const sendEventUpdateNotification = async (
    eventId: string,
    message: string
  ) => {
    const response =
      await trpc.notification.sendEventUpdateNotifications.mutate({
        eventId,
        message,
      });
    return response;
  };

  // Send cancellation notifications for a specific event
  const sendEventCancellationNotification = async (eventId: string) => {
    const response =
      await trpc.notification.sendEventCancellationNotifications.mutate({
        eventId,
      });
    return response;
  };

  return {
    sendEventReminders,
    sendEventUpdateNotification,
    sendEventCancellationNotification,
  };
}
