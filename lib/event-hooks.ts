"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Event, EventRegistration } from "@/lib/events-db";
import { trpc } from "@/lib/trpc";

// Event query hooks with tRPC
export function useEvents() {
  return trpc.event.getAll.useQuery();
}

export function useApprovedEvents() {
  return trpc.event.getAll.useQuery();
}

export function useEvent(eventId: string) {
  return trpc.event.getById.useQuery({ id: eventId }, { enabled: !!eventId });
}

export function useUserEvents(userId: string) {
  return trpc.event.getUserEvents.useQuery({ userId }, { enabled: !!userId });
}

export function useUserRegisteredEvents(userId: string) {
  return trpc.event.getRegisteredEvents.useQuery(
    { userId },
    { enabled: !!userId }
  );
}

export function useSearchEvents(
  query: string,
  options?: {
    category?: string;
    startDate?: Date;
    endDate?: Date;
  }
) {
  return trpc.event.search.useQuery(
    {
      query,
      category: options?.category,
      startDate: options?.startDate,
      endDate: options?.endDate,
    },
    { enabled: !!query && query.length > 2 }
  );
}

// Mutation hooks
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return trpc.event.createEvent.useMutation({
    onSuccess: () => {
      toast.success("Event created successfully! Awaiting approval.");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => {
      toast.error("Failed to create event. Please try again.");
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return trpc.event.updateEvent.useMutation({
    onSuccess: (data: Event) => {
      toast.success("Event updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", data.id] });
    },
    onError: () => {
      toast.error("Failed to update event. Please try again.");
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return trpc.event.deleteEvent.useMutation({
    onSuccess: () => {
      toast.success("Event deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => {
      toast.error("Failed to delete event. Please try again.");
    },
  });
}

export function useRegisterForEvent() {
  const queryClient = useQueryClient();

  return trpc.event.registerForEvent.useMutation({
    onSuccess: (data: EventRegistration) => {
      toast.success("Registration successful!");
      queryClient.invalidateQueries({
        queryKey: ["events", "registered", data.userId],
      });
    },
    onError: () => {
      toast.error("Failed to register. Please try again.");
    },
  });
}

export function useCancelRegistration() {
  const queryClient = useQueryClient();

  return trpc.event.cancelRegistration.useMutation({
    onSuccess: (_: boolean, variables: { eventId: string; userId: string }) => {
      toast.success("Registration cancelled successfully!");
      queryClient.invalidateQueries({
        queryKey: ["events", "registered", variables.userId],
      });
    },
    onError: () => {
      toast.error("Failed to cancel registration. Please try again.");
    },
  });
}
