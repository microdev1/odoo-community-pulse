import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, adminProcedure, router } from "../trpc";
import {
  sendEventCancellationNotifications,
  sendEventReminders,
  sendEventUpdateNotifications,
} from "@/server/services/notification-service";

export const notificationRouter = router({
  // Send reminders for events happening tomorrow from admin UI
  sendEventReminders: adminProcedure.mutation(async () => {
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
  sendEventUpdateNotifications: adminProcedure
    .input(
      z.object({
        eventId: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await sendEventUpdateNotifications(input.eventId, input.message);
    }),

  // Send cancellation notifications for a specific event
  sendEventCancellationNotifications: adminProcedure
    .input(
      z.object({
        eventId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await sendEventCancellationNotifications(input.eventId);
    }),
});
