"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        className: "border-border shadow-lg",
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
        },
      }}
    />
  );
}
