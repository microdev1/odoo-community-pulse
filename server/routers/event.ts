"use server";

import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { ServerEventService } from "../services/event-service";

export const eventRouter = router({
  getAll: publicProcedure.query(async () => {
    // Using server-side event service to get events
    return await ServerEventService.getApprovedEvents();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // Using server-side event service to get event by id
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
      // Use the server-side implementation with filtering options
      if (input.query) {
        return await ServerEventService.searchEvents(input.query, {
          category: input.category,
          startDate: input.startDate,
          endDate: input.endDate,
        });
      }

      // If no query is provided, just get all approved events and apply filters
      const events = await ServerEventService.getApprovedEvents();

      // Filter by category if provided
      let filteredEvents = events;
      if (input.category) {
        filteredEvents = filteredEvents.filter(
          (event) => event.category === input.category
        );
      }

      // Filter by date range if provided
      if (input.startDate) {
        filteredEvents = filteredEvents.filter(
          (event) => new Date(event.date) >= input.startDate
        );
      }

      if (input.endDate) {
        filteredEvents = filteredEvents.filter(
          (event) => new Date(event.date) <= input.endDate
        );
      }

      return filteredEvents;
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
    .mutation(async ({ input }) => {
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
    .mutation(async ({ input }) => {
      const { id, ...eventData } = input;
      return await ServerEventService.updateEvent(id, eventData);
    }),

  // Add mutation to delete an event
  deleteEvent: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await ServerEventService.deleteEvent(input.id);
    }),

  // Add query to get events by user
  getUserEvents: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await ServerEventService.getUserEvents(input.userId);
    }),

  // Add query to get registered events for a user
  getRegisteredEvents: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
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
    .mutation(async ({ input }) => {
      return await ServerEventService.registerForEvent(input);
    }),

  // Add query to check if user is registered for an event
  isUserRegistered: publicProcedure
    .input(z.object({ eventId: z.string(), userId: z.string() }))
    .query(async ({ input }) => {
      return await ServerEventService.isUserRegistered(
        input.eventId,
        input.userId
      );
    }),

  // Add mutation to cancel registration for an event
  cancelRegistration: publicProcedure
    .input(z.object({ eventId: z.string(), userId: z.string() }))
    .mutation(async ({ input }) => {
      return await ServerEventService.cancelRegistration(
        input.eventId,
        input.userId
      );
    }),

  // Admin procedures
  approveEvent: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await ServerEventService.approveEvent(input.id);
    }),

  rejectEvent: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await ServerEventService.rejectEvent(input.id);
    }),
});
