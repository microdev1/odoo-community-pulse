import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { getCurrentUser } from "@/server/services/user-service";

// Create a context for each request
const createContext = async (req: Request) => {
  // Get the authorization header
  const authHeader = req.headers.get("authorization");

  // If there's no token, return an empty context
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null };
  }

  // Extract the token
  const token = authHeader.split(" ")[1];

  // Get the user from the token
  const user = await getCurrentUser(token);

  // Return the context with the user
  return { user };
};

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
  });

export { handler as GET, handler as POST };
