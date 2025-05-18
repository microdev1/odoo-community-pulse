"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EventService } from "@/lib/event-service";
import { Event, EventRegistration } from "@/lib/events-db";

// Event query hooks
export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: () => EventService.getEvents(),
  });
}

export function useApprovedEvents() {
  return useQuery({
    queryKey: ["events", "approved"],
    queryFn: () => EventService.getApprovedEvents(),
  });
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: () => EventService.getEventById(eventId),
    enabled: !!eventId,
  });
}

export function useUserEvents(userId: string) {
  return useQuery({
    queryKey: ["events", "user", userId],
    queryFn: () => EventService.getUserEvents(userId),
    enabled: !!userId,
  });
}

export function useUserRegisteredEvents(userId: string) {
  return useQuery({
    queryKey: ["events", "registered", userId],
    queryFn: () => EventService.getRegisteredEvents(userId),
    enabled: !!userId,
  });
}

export function useSearchEvents(query: string) {
  return useQuery({
    queryKey: ["events", "search", query],
    queryFn: () => EventService.searchEvents(query),
    enabled: !!query && query.length > 2,
  });
}

// Mutation hooks
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventData: Omit<Event, "id" | "createdAt" | "isApproved">) =>
      EventService.createEvent(eventData),
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

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Event> }) =>
      EventService.updateEvent(id, data),
    onSuccess: (data) => {
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

  return useMutation({
    mutationFn: (eventId: string) => EventService.deleteEvent(eventId),
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

  return useMutation({
    mutationFn: (
      registration: Omit<EventRegistration, "id" | "registeredAt">
    ) => EventService.registerForEvent(registration),
    onSuccess: (data) => {
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

  return useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) =>
      EventService.cancelRegistration(eventId, userId),
    onSuccess: (_, { userId }) => {
      toast.success("Registration cancelled successfully!");
      queryClient.invalidateQueries({
        queryKey: ["events", "registered", userId],
      });
    },
    onError: () => {
      toast.error("Failed to cancel registration. Please try again.");
    },
  });
}
