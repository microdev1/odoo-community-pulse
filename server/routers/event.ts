"use server";

import { publicProcedure, router } from "../trpc";
import { z } from "zod";

export const eventRouter = router({
  getAll: publicProcedure.query(async () => {}),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {}),

  search: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        category: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {}),

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
    .mutation(async ({ input }) => {}),

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
    .mutation(async ({ input }) => {}),

  // Add mutation to delete an event
  deleteEvent: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {}),

  // Add query to get events by user
  getUserEvents: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {}),

  // Add query to get registered events for a user
  getRegisteredEvents: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {}),

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
    .mutation(async ({ input }) => {}),

  // Add query to check if user is registered for an event
  isUserRegistered: publicProcedure
    .input(z.object({ eventId: z.string(), userId: z.string() }))
    .query(async ({ input }) => {}),

  // Add mutation to cancel registration for an event
  cancelRegistration: publicProcedure
    .input(z.object({ eventId: z.string(), userId: z.string() }))
    .mutation(async ({ input }) => {}),

  // Admin procedures
  approveEvent: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {}),

  rejectEvent: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {}),
});
