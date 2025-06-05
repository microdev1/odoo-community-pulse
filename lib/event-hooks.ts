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

export function useEvents() {
  const [isLoading, setIsLoading] = useState(false);

  // Get all approved events
  const getAllEvents = trpc.event.getAll.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get single event by ID
  const getEventById = (id: string) => {
    return trpc.event.getById.useQuery(
      { id },
      {
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!id,
      }
    );
  };

  // Search events
  const searchEvents = (params: {
    query?: string;
    category?: string;
    startDate?: Date;
    endDate?: Date;
  }) => {
    return trpc.event.search.useQuery(params, {
      staleTime: 1000 * 60, // 1 minute
    });
  };

  // Create event mutation
  const createEventMutation = trpc.event.createEvent.useMutation();

  // Update event mutation
  const updateEventMutation = trpc.event.updateEvent.useMutation();

  // Delete event mutation
  const deleteEventMutation = trpc.event.deleteEvent.useMutation();

  // Get user's events
  const getUserEvents = (userId: string) => {
    return trpc.event.getUserEvents.useQuery(
      { userId },
      {
        staleTime: 1000 * 60, // 1 minute
        enabled: !!userId,
      }
    );
  };

  // Get user's registered events
  const getRegisteredEvents = (userId: string) => {
    return trpc.event.getRegisteredEvents.useQuery(
      { userId },
      {
        staleTime: 1000 * 60, // 1 minute
        enabled: !!userId,
      }
    );
  };

  // Register for event mutation
  const registerForEventMutation = trpc.event.registerForEvent.useMutation();

  // Check if user is registered for an event
  const isUserRegistered = (eventId: string, userId: string) => {
    return trpc.event.isUserRegistered.useQuery(
      { eventId, userId },
      {
        staleTime: 1000 * 60, // 1 minute
        enabled: !!eventId && !!userId,
      }
    );
  };

  // Cancel registration mutation
  const cancelRegistrationMutation =
    trpc.event.cancelRegistration.useMutation();

  // Admin: Approve event mutation
  const approveEventMutation = trpc.event.approveEvent.useMutation();

  // Admin: Reject event mutation
  const rejectEventMutation = trpc.event.rejectEvent.useMutation();

  // Create an event
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

  // Update an event
  const updateEvent = async (eventData: any) => {
    setIsLoading(true);
    try {
      const result = await updateEventMutation.mutateAsync(eventData);
      toast.success("Event updated successfully and pending approval");
      return result;
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error(
        `Failed to update event: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an event
  const deleteEvent = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await deleteEventMutation.mutateAsync({ id });
      toast.success("Event deleted successfully");
      return result;
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error(
        `Failed to delete event: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register for an event
  const registerForEvent = async (registrationData: any) => {
    setIsLoading(true);
    try {
      const result =
        await registerForEventMutation.mutateAsync(registrationData);
      toast.success("Registration successful");
      return result;
    } catch (error) {
      console.error("Error registering for event:", error);
      toast.error(
        `Failed to register: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel registration
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

  // Admin: Approve an event
  const approveEvent = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await approveEventMutation.mutateAsync({ id });
      toast.success("Event approved successfully");
      return result;
    } catch (error) {
      console.error("Error approving event:", error);
      toast.error(
        `Failed to approve event: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Admin: Reject an event
  const rejectEvent = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await rejectEventMutation.mutateAsync({ id });
      toast.success("Event rejected successfully");
      return result;
    } catch (error) {
      console.error("Error rejecting event:", error);
      toast.error(
        `Failed to reject event: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    // Queries
    getAllEvents,
    getEventById,
    searchEvents,
    getUserEvents,
    getRegisteredEvents,
    isUserRegistered,
    // Mutations
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    cancelRegistration,
    approveEvent,
    rejectEvent,
  };
}
