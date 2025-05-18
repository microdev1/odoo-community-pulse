"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // This should only render if authenticated
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={logout}
          className="rounded bg-red-100 px-4 py-2 text-sm text-red-700 transition-colors hover:bg-red-200"
        >
          Logout
        </button>
      </div>

      <div className="rounded-lg border p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">
          Welcome, {user?.username}!
        </h2>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-md bg-gray-50 p-4">
            <h3 className="text-lg font-medium">User Information</h3>
            <ul className="mt-2 space-y-1">
              <li>
                <span className="font-medium">Email:</span> {user?.email}
              </li>
              {user?.phone && (
                <li>
                  <span className="font-medium">Phone:</span> {user?.phone}
                </li>
              )}
              <li>
                <span className="font-medium">Role:</span>{" "}
                {isAdmin ? (
                  <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800">
                    Admin
                  </span>
                ) : (
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                    User
                  </span>
                )}
              </li>
              <li>
                <span className="font-medium">Member since:</span>{" "}
                {new Date(user?.createdAt || "").toLocaleDateString()}
              </li>
            </ul>
          </div>

          {isAdmin && (
            <div className="rounded-md bg-purple-50 p-4">
              <h3 className="text-lg font-medium">Admin Panel</h3>
              <p className="mt-2 text-sm">
                As an admin, you have access to additional features and
                settings.
              </p>
              <div className="mt-4">
                <button className="rounded bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-200">
                  Manage Users
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-md bg-blue-50 p-4">
          <h3 className="text-lg font-medium">Getting Started</h3>
          <p className="mt-2 text-sm">
            This is your dashboard where you can manage your account and access
            various features.
            {isAdmin
              ? " As an admin, you have access to all platform features and user management."
              : " Explore the available options to get the most out of our platform."}
          </p>
        </div>
      </div>
    </div>
  );
}
