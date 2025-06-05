"use client";

import React from "react";
import { toast } from "sonner";

export class AuthErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Auth error:", error);
    toast.error("Authentication error. Please try logging in again.");
    // Force a page reload to clear any stale auth state
    window.location.href = "/auth";
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="mb-4 text-xl font-bold">Authentication Error</h2>
            <p className="mb-4">Please try logging in again.</p>
            <button
              onClick={() => (window.location.href = "/auth")}
              className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
