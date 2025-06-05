import {
  getAllUsers,
  loginUser,
  registerUser,
  getCurrentUser,
  setVerifiedStatus,
  banUser,
  unbanUser,
} from "@/server/services/user-service";
import {
  publicProcedure,
  privateProcedure,
  adminProcedure,
  router,
} from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const userRouter = router({
  // Get user by ID
  getById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      // Check if user is requesting their own info or is admin
      if (ctx.user.id !== input.id && !ctx.user.isAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You can only view your own user info",
        });
      }

      const users = await getAllUsers();
      const user = users.find((user) => user.id === input.id);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      return user;
    }),

  // Get all users (admin only)
  getAllUsers: adminProcedure.query(async () => {
    return await getAllUsers();
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
      return await loginUser(input);
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
      return await registerUser(input);
    }),

  // Validate token and get current user
  getCurrentUser: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await getCurrentUser(input.token);
    }),

  // Admin functions
  setVerifiedStatus: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        isVerified: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      return await setVerifiedStatus(input.userId, input.isVerified);
    }),

  banUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await banUser(input.userId, input.reason);
    }),

  unbanUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await unbanUser(input.userId);
    }),
});
