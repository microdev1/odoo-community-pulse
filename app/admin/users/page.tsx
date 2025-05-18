"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User } from "@/lib/mock-db";
import { EventService } from "@/lib/event-service";

export default function AdminUsersPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<
    (Omit<User, "password"> & {
      isVerifiedOrganizer?: boolean;
      isBanned?: boolean;
    })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect if no longer loading authentication state
    if (!isLoading) {
      // Redirect non-authenticated users to login
      if (!isAuthenticated) {
        router.push("/auth");
        return;
      }

      // Redirect non-admins to home
      if (!isAdmin) {
        router.push("/");
        return;
      }
    }

    async function fetchUsers() {
      if (isAdmin) {
        setIsLoading(true);
        try {
          // In a real app, this would be a direct API call
          // Here we're dynamically importing to mock the database access
          const { users } = await import("@/lib/mock-db");

          // Strip passwords for security
          const safeUsers = users.map(({ password: _, ...user }) => user);
          setUsers(safeUsers);
        } catch (error) {
          console.error("Failed to fetch users:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (isAuthenticated && isAdmin) {
      fetchUsers();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAdmin, router, isLoading]);

  const handleVerifyUser = async (userId: string, isVerified: boolean) => {
    try {
      await EventService.setUserVerifiedStatus(userId, isVerified);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? { ...user, isVerifiedOrganizer: isVerified }
            : user
        )
      );
      toast.success(
        `User ${isVerified ? "verified" : "unverified"} successfully`
      );
    } catch (error) {
      console.error("Failed to update user verification status:", error);
      toast.error("Failed to update user verification status");
    }
  };

  const handleBanUser = async (userId: string) => {
    const reason = prompt("Please enter a reason for banning this user:");
    if (!reason) return;

    try {
      await EventService.banUser(userId, reason);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? { ...user, isBanned: true, banReason: reason }
            : user
        )
      );
      toast.success("User banned successfully");
    } catch (error) {
      console.error("Failed to ban user:", error);
      toast.error("Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await EventService.unbanUser(userId);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? { ...user, isBanned: false, banReason: undefined }
            : user
        )
      );
      toast.success("User unbanned successfully");
    } catch (error) {
      console.error("Failed to unban user:", error);
      toast.error("Failed to unban user");
    }
  };

  const handleViewUserEvents = (userId: string) => {
    router.push(`/admin/user-events/${userId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <h1 className="mb-6 text-3xl font-bold">
            Admin Dashboard - User Management
          </h1>
          <div className="mb-6">
            <a href="/admin" className="text-blue-500 hover:underline">
              ← Back to Events
            </a>
          </div>
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">
          Admin Dashboard - User Management
        </h1>

        <div className="mb-6">
          <a href="/admin" className="text-blue-500 hover:underline">
            ← Back to Events
          </a>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Username
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map((user) => (
                <tr key={user.id} className={user.isBanned ? "bg-red-50" : ""}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {user.username}
                        {user.isAdmin && (
                          <span className="ml-2 rounded-full bg-blue-100 px-2 text-xs font-semibold text-blue-800">
                            Admin
                          </span>
                        )}
                        {user.isVerifiedOrganizer && (
                          <span className="ml-2 rounded-full bg-green-100 px-2 text-xs font-semibold text-green-800">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {user.isBanned ? (
                      <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">
                        Banned
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUserEvents(user.id)}
                      >
                        View Events
                      </Button>

                      {!user.isAdmin && (
                        <>
                          {user.isVerifiedOrganizer ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerifyUser(user.id, false)}
                            >
                              Remove Verification
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerifyUser(user.id, true)}
                            >
                              Verify Organizer
                            </Button>
                          )}

                          {user.isBanned ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnbanUser(user.id)}
                            >
                              Unban User
                            </Button>
                          ) : (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleBanUser(user.id)}
                            >
                              Ban User
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
