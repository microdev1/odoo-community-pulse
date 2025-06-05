"use server";

import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { ServerEventService } from "@/server/services/event-service";
import { NotificationService } from "@/server/services/notification-service";

export const eventRouter = router({
  getAll: publicProcedure.query(async () => {
    return await ServerEventService.getAllEvents();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await ServerEventService.getEventById(input.id);
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        category: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      return await ServerEventService.searchEvents(input);
    }),

  // Add mutation to create an event
  createEvent: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        shortDescription: z.string().optional(),
        imageUrl: z.string(),
        date: z.date(),
        endDate: z.date().optional(),
        location: z.object({
          address: z.string(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
        }),
        category: z.string(),
        organizer: z.object({
          id: z.string(),
          name: z.string(),
          phone: z.string().optional(),
          email: z.string().email(),
        }),
        isFree: z.boolean(),
        ticketTiers: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              price: z.number(),
              description: z.string(),
            })
          )
          .optional(),
        registrationDeadline: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user is authenticated
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      // Verify the organizer ID matches the authenticated user
      if (input.organizer.id !== ctx.user.id) {
        throw new Error(
          "Unauthorized: organizer ID must match authenticated user"
        );
      }

      return await ServerEventService.createEvent(input);
    }),

  // Add mutation to update an event
  updateEvent: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        imageUrl: z.string().optional(),
        date: z.date().optional(),
        endDate: z.date().optional(),
        location: z
          .object({
            address: z.string(),
            latitude: z.number().optional(),
            longitude: z.number().optional(),
          })
          .optional(),
        category: z.string().optional(),
        isFree: z.boolean().optional(),
        ticketTiers: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              price: z.number(),
              description: z.string(),
            })
          )
          .optional(),
        registrationDeadline: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user is authenticated
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      // Get the event to check ownership
      const event = await ServerEventService.getEventById(input.id);
      if (!event) {
        throw new Error("Event not found");
      }

      // Check if user is the organizer or an admin
      if (event.organizerId !== ctx.user.id && !ctx.user.isAdmin) {
        throw new Error(
          "Unauthorized: you must be the event organizer to update it"
        );
      }

      const result = await ServerEventService.updateEvent(input.id, input);

      // Send notifications to registered users about the update
      if (result.success) {
        await NotificationService.sendEventUpdateNotifications(
          input.id,
          `The event "${event.title}" has been updated. Please check the event page for details.`
        );
      }

      return result;
    }),

  // Add mutation to delete an event
  deleteEvent: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Check if user is authenticated
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      // Get the event to check ownership
      const event = await ServerEventService.getEventById(input.id);
      if (!event) {
        throw new Error("Event not found");
      }

      // Check if user is the organizer or an admin
      if (event.organizerId !== ctx.user.id && !ctx.user.isAdmin) {
        throw new Error(
          "Unauthorized: you must be the event organizer to delete it"
        );
      }

      // Send cancellation notifications to registered users
      await NotificationService.sendEventCancellationNotifications(input.id);

      return await ServerEventService.deleteEvent(input.id);
    }),

  // Add query to get events by user
  getUserEvents: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Check if user is authenticated and requesting their own events
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      // Check if user is requesting their own events or is an admin
      if (input.userId !== ctx.user.id && !ctx.user.isAdmin) {
        throw new Error("Unauthorized: you can only view your own events");
      }

      return await ServerEventService.getUserEvents(input.userId);
    }),

  // Add query to get registered events for a user
  getRegisteredEvents: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Check if user is authenticated and requesting their own registrations
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      // Check if user is requesting their own registrations or is an admin
      if (input.userId !== ctx.user.id && !ctx.user.isAdmin) {
        throw new Error(
          "Unauthorized: you can only view your own registrations"
        );
      }

      return await ServerEventService.getRegisteredEvents(input.userId);
    }),

  // Add mutation to register for an event
  registerForEvent: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        userId: z.string(),
        name: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
        additionalAttendees: z.number().default(0),
        ticketTierId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user is authenticated and registering themselves
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      // Check if user is registering themselves
      if (input.userId !== ctx.user.id) {
        throw new Error("Unauthorized: you can only register yourself");
      }

      return await ServerEventService.registerForEvent(input);
    }),

  // Add query to check if user is registered for an event
  isUserRegistered: publicProcedure
    .input(z.object({ eventId: z.string(), userId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Check if user is authenticated and checking their own registration
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      // Check if user is checking their own registration or is an admin
      if (input.userId !== ctx.user.id && !ctx.user.isAdmin) {
        throw new Error(
          "Unauthorized: you can only check your own registration"
        );
      }

      return await ServerEventService.isUserRegistered(
        input.eventId,
        input.userId
      );
    }),

  // Add mutation to cancel registration for an event
  cancelRegistration: publicProcedure
    .input(z.object({ eventId: z.string(), userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Check if user is authenticated and cancelling their own registration
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      // Check if user is cancelling their own registration or is an admin
      if (input.userId !== ctx.user.id && !ctx.user.isAdmin) {
        throw new Error(
          "Unauthorized: you can only cancel your own registration"
        );
      }

      return await ServerEventService.cancelRegistration(
        input.eventId,
        input.userId
      );
    }),

  // Admin procedures
  approveEvent: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Check if user is admin
      if (!ctx.user?.isAdmin) {
        throw new Error("Unauthorized: admin access required");
      }

      return await ServerEventService.approveEvent(input.id);
    }),

  rejectEvent: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Check if user is admin
      if (!ctx.user?.isAdmin) {
        throw new Error("Unauthorized: admin access required");
      }

      return await ServerEventService.rejectEvent(input.id);
    }),
});
