"use server";

import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { ServerUserService } from "../services/user-service";

export const userRouter = router({
  // Get user by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      // Check if user is admin or requesting their own info
      if (!ctx.user || (ctx.user.id !== input.id && !ctx.user.isAdmin)) {
        throw new Error("Unauthorized");
      }

      const users = await ServerUserService.getAllUsers();
      return users.find((user) => user.id === input.id);
    }),

  // Get all users (admin only)
  getAllUsers: publicProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    if (!ctx.user?.isAdmin) {
      throw new Error("Unauthorized");
    }

    return await ServerUserService.getAllUsers();
  }),

  // Login
  login: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await ServerUserService.loginUser(input);
    }),

  // Register new user
  register: publicProcedure
    .input(
      z.object({
        username: z.string(),
        email: z.string().email(),
        password: z.string().min(6),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await ServerUserService.registerUser(input);
    }),

  // Validate token and get current user
  getCurrentUser: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await ServerUserService.getCurrentUser(input.token);
    }),

  // Admin functions
  setVerifiedStatus: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        isVerified: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user is admin
      if (!ctx.user?.isAdmin) {
        throw new Error("Unauthorized");
      }

      return await ServerUserService.setVerifiedStatus(
        input.userId,
        input.isVerified
      );
    }),

  banUser: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user is admin
      if (!ctx.user?.isAdmin) {
        throw new Error("Unauthorized");
      }

      return await ServerUserService.banUser(input.userId, input.reason);
    }),

  unbanUser: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user is admin
      if (!ctx.user?.isAdmin) {
        throw new Error("Unauthorized");
      }

      return await ServerUserService.unbanUser(input.userId);
    }),
});
