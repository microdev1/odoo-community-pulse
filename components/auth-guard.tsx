"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect, ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only run after authentication state is loaded
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to auth page with the current path as returnUrl
        const currentPath = window.location.pathname;
        router.replace(`/auth?returnUrl=${encodeURIComponent(currentPath)}`);
      }
    }
  }, [isLoading, isAuthenticated, router]);

  // If still loading or not authenticated, show loading state
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If we get here, the user is authenticated
  return <>{children}</>;
}
