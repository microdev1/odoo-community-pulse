"use client";

import { createTRPCReact } from "@trpc/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState, ReactNode } from "react";
import type { AppRouter } from "@/server/routers/_app";
import superjson from "superjson";

// Create the tRPC client
export const trpc = createTRPCReact<AppRouter>();

// Provider for the tRPC client
export function TRPCProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
          headers() {
            // Only get token from cookie
            const token = document.cookie
              .split("; ")
              .find((row) => row.startsWith("authToken="))
              ?.split("=")[1];
            return {
              Authorization: token ? `Bearer ${token}` : "",
            };
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
