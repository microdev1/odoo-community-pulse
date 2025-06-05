"use server";

import { initTRPC } from "@trpc/server";
import { ZodError } from "zod";

// Define the context type
export type Context = {
  user: {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
    isVerified: boolean;
  } | null;
};

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
  errorFormatter(opts) {
    const { shape, error } = opts;
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
