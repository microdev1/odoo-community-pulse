"use client";

import { useEffect, useState } from "react";
import { trpc } from "./trpc";
import { toast } from "sonner";

export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  imageUrl: string;
  date: string;
  endDate?: string;
  locationAddress: string;
  locationLatitude?: number;
  locationLongitude?: number;
  category: string;
  organizerId: string;
  organizer?: {
    id: string;
    username: string;
    email: string;
    phone?: string;
    isVerified: boolean;
  };
  isFree: boolean;
  ticketTiers?: Array<{
    id: string;
    name: string;
    price: number;
    description: string;
  }>;
  registrationDeadline?: string;
  isApproved: boolean;
  isRejected: boolean;
  isFlagged?: boolean;
  flagReason?: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  additionalAttendees: number;
  ticketTierId?: string;
  createdAt: string;
}

export interface RegisteredEvent extends Event {
  registrationId: string;
  registrationDate: string;
  additionalAttendees: number;
}

// Custom hook to get a single event
export function useEvent(id: string) {
  return trpc.event.getById.useQuery(
    { id },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      enabled: !!id,
    }
  );
}

// Custom hook to search events
export function useSearchEvents(params: {
  query?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  return trpc.event.search.useQuery(params, {
    staleTime: 1000 * 60, // 1 minute
  });
}

// Custom hook to get user's events
export function useUserEvents(userId: string) {
  return trpc.event.getUserEvents.useQuery(
    { userId },
    {
      staleTime: 1000 * 60, // 1 minute
      enabled: !!userId,
    }
  );
}

// Custom hook to get user's registered events
export function useUserRegisteredEvents(userId: string) {
  return trpc.event.getRegisteredEvents.useQuery(
    { userId },
    {
      staleTime: 1000 * 60, // 1 minute
      enabled: !!userId,
    }
  );
}

// Custom hook for event registration cancellation
export function useCancelRegistration() {
  const [isLoading, setIsLoading] = useState(false);
  const cancelRegistrationMutation =
    trpc.event.cancelRegistration.useMutation();

  const cancelRegistration = async (eventId: string, userId: string) => {
    setIsLoading(true);
    try {
      const result = await cancelRegistrationMutation.mutateAsync({
        eventId,
        userId,
      });
      toast.success("Registration cancelled successfully");
      return result;
    } catch (error) {
      console.error("Error cancelling registration:", error);
      toast.error(
        `Failed to cancel registration: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    cancelRegistration,
    isLoading,
  };
}

// Main events hook with remaining functionality
export function useEvents() {
  const [isLoading, setIsLoading] = useState(false);

  // Get all approved events
  const getAllEvents = trpc.event.getAll.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create event mutation
  const createEventMutation = trpc.event.createEvent.useMutation();

  // Update event mutation
  const updateEventMutation = trpc.event.updateEvent.useMutation();

  // Delete event mutation
  const deleteEventMutation = trpc.event.deleteEvent.useMutation();

  // Register for event mutation
  const registerForEventMutation = trpc.event.registerForEvent.useMutation();

  // Admin mutations
  const approveEventMutation = trpc.event.approveEvent.useMutation();
  const rejectEventMutation = trpc.event.rejectEvent.useMutation();

  // Notification mutations
  const sendRemindersMutation =
    trpc.notification.sendEventReminders.useMutation();
  const sendUpdateNotificationMutation =
    trpc.notification.sendEventUpdateNotifications.useMutation();
  const sendCancellationNotificationMutation =
    trpc.notification.sendEventCancellationNotifications.useMutation();

  const createEvent = async (eventData: any) => {
    setIsLoading(true);
    try {
      const result = await createEventMutation.mutateAsync(eventData);
      toast.success("Event created successfully and pending approval");
      return result;
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error(
        `Failed to create event: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Send event reminders
  const sendEventReminders = async () => {
    try {
      const result = await sendRemindersMutation.mutateAsync();
      toast.success("Event reminders sent successfully");
      return result;
    } catch (error) {
      console.error("Error sending event reminders:", error);
      toast.error(
        `Failed to send reminders: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  };

  // Send event update notifications
  const sendEventUpdateNotification = async (
    eventId: string,
    message: string
  ) => {
    try {
      const result = await sendUpdateNotificationMutation.mutateAsync({
        eventId,
        message,
      });
      toast.success("Event update notifications sent successfully");
      return result;
    } catch (error) {
      console.error("Error sending event update notifications:", error);
      toast.error(
        `Failed to send update notifications: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  };

  // Send event cancellation notifications
  const sendEventCancellationNotification = async (eventId: string) => {
    try {
      const result = await sendCancellationNotificationMutation.mutateAsync({
        eventId,
      });
      toast.success("Event cancellation notifications sent successfully");
      return result;
    } catch (error) {
      console.error("Error sending event cancellation notifications:", error);
      toast.error(
        `Failed to send cancellation notifications: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  };

  return {
    events: getAllEvents.data,
    isLoading: isLoading || getAllEvents.isLoading,
    error: getAllEvents.error,
    createEvent,
    approveEventMutation,
    rejectEventMutation,
    sendEventReminders,
    sendEventUpdateNotification,
    sendEventCancellationNotification,
  };
}
