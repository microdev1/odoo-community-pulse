"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect, ReactNode } from "react";

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only run after authentication state is loaded
    if (!isLoading) {
      // Redirect non-authenticated users to login
      if (!isAuthenticated) {
        router.push("/auth");
        return;
      }

      // Redirect non-admins to home
      if (!user?.isAdmin) {
        router.push("/");
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // If still loading or not authenticated/admin, don't render anything
  if (isLoading || !isAuthenticated || !user?.isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If we get here, the user is authenticated and is an admin
  return <>{children}</>;
}
