"use server";

import { publicProcedure, router } from "../trpc";
import { z } from "zod";

export const userRouter = router({
  // Get user by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {}),

  // Get all users (admin only)
  getAllUsers: publicProcedure.query(async () => {}),

  // Login
  login: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {}),

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
    .mutation(async ({ input }) => {}),

  // Validate token and get current user
  getCurrentUser: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .query(async ({ input }) => {}),

  // Admin functions
  setVerifiedStatus: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        isVerified: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {}),

  banUser: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input }) => {}),

  unbanUser: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {}),
});
