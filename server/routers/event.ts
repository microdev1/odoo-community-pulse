import {
  getAllEvents,
  getEventById,
  searchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getUserEvents,
  getRegisteredEvents,
  registerForEvent,
  isUserRegistered,
  cancelRegistration,
  approveEvent,
  rejectEvent,
} from "@/server/services/event-service";
import {
  sendEventCancellationNotifications,
  sendEventUpdateNotifications,
} from "@/server/services/notification-service";
import {
  publicProcedure,
  privateProcedure,
  adminProcedure,
  router,
} from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const eventRouter = router({
  getAll: publicProcedure.query(async () => {
    return await getAllEvents();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await getEventById(input.id);
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
      return await searchEvents(input);
    }),

  // Add mutation to create an event
  createEvent: privateProcedure
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
      // Verify the organizer ID matches the authenticated user
      if (input.organizer.id !== ctx.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Organizer ID must match authenticated user",
        });
      }

      return await createEvent(input);
    }),

  // Add mutation to update an event
  updateEvent: privateProcedure
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
      // Get the event to check ownership
      const event = await getEventById(input.id);
      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      // Check if user is the organizer or an admin
      if (event.organizerId !== ctx.user.id && !ctx.user.isAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be the event organizer to update it",
        });
      }

      const result = await updateEvent(input.id, input);

      // Send notifications to registered users about the update
      if (result.success) {
        await sendEventUpdateNotifications(
          input.id,
          `The event "${event.title}" has been updated. Please check the event page for details.`
        );
      }

      return result;
    }),

  // Add mutation to delete an event
  deleteEvent: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Get the event to check ownership
      const event = await getEventById(input.id);
      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      // Check if user is the organizer or an admin
      if (event.organizerId !== ctx.user.id && !ctx.user.isAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be the event organizer to delete it",
        });
      }

      // Send cancellation notifications to registered users
      await sendEventCancellationNotifications(input.id);

      return await deleteEvent(input.id);
    }),

  // Add query to get events by user
  getUserEvents: privateProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await getUserEvents(input.userId);
    }),

  // Add query to get registered events for a user
  getRegisteredEvents: privateProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await getRegisteredEvents(input.userId);
    }),

  // Add mutation to register for an event
  registerForEvent: privateProcedure
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
      return await registerForEvent(input);
    }),

  // Add query to check if user is registered for an event
  isUserRegistered: privateProcedure
    .input(z.object({ eventId: z.string(), userId: z.string() }))
    .query(async ({ input }) => {
      return await isUserRegistered(input.eventId, input.userId);
    }),

  // Add mutation to cancel registration for an event
  cancelRegistration: privateProcedure
    .input(z.object({ eventId: z.string(), userId: z.string() }))
    .mutation(async ({ input }) => {
      return await cancelRegistration(input.eventId, input.userId);
    }),

  // Admin procedures
  approveEvent: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const result = await approveEvent(input.id);
      if (result.success) {
        // Send approval notification
        await sendEventUpdateNotifications(
          input.id,
          "Your event has been approved! It will now be visible to the public."
        );
      }
      return result;
    }),

  rejectEvent: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const result = await rejectEvent(input.id);
      if (result.success) {
        // Send rejection notification
        await sendEventUpdateNotifications(
          input.id,
          "Your event has been rejected. Please review the event guidelines and make necessary changes to resubmit."
        );
      }
      return result;
    }),
});
