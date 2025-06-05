import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../trpc";
import {
  sendEventCancellationNotifications,
  sendEventReminders,
  sendEventUpdateNotifications,
} from "@/server/services/notification-service";

export const notificationRouter = router({
  // Send reminders for events happening tomorrow from admin UI
  sendEventReminders: publicProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user?.isAdmin) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Unauthorized: admin access required",
      });
    }
    return await sendEventReminders();
  }),

  // Send reminders for events happening tomorrow (called by cron job)
  sendScheduledReminders: publicProcedure
    .input(
      z.object({
        cronSecret: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const configuredSecret = process.env.CRON_SECRET || "cron-secret-key";
      if (input.cronSecret !== configuredSecret) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized: Invalid cron secret",
        });
      }
      return await sendEventReminders();
    }),

  // Send update notifications for a specific event
  sendEventUpdateNotifications: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.isAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized: admin access required",
        });
      }
      return await sendEventUpdateNotifications(input.eventId, input.message);
    }),

  // Send cancellation notifications for a specific event
  sendEventCancellationNotifications: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.isAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized: admin access required",
        });
      }
      return await sendEventCancellationNotifications(input.eventId);
    }),
});
