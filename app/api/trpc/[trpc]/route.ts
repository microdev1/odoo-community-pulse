import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { getCurrentUser } from "@/server/services/user-service";
import type { Context } from "@/server/trpc";

// Create a context for each request
const createContext = async (req: Request): Promise<Context> => {
  try {
    // Get the authorization header
    const authHeader = req.headers.get("authorization");

    // Try to get token from authorization header first
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : undefined;

    // If no valid token found in header or cookie, return empty context
    if (!token) {
      return { user: null };
    }

    // Get the user from the token
    const result = await getCurrentUser(token);

    // Return the context with the user if successful
    if (result.success && "user" in result && result.user) {
      const user = result.user;
      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin ?? false,
          isVerified: user.isVerified ?? false,
        },
      };
    }

    // If token validation failed, return empty context
    return { user: null };
  } catch (error) {
    console.error("Error creating tRPC context:", error);
    return { user: null };
  }
};

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
  });

export { handler as GET, handler as POST };
