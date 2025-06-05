"use client";

import { useState } from "react";
import { trpc } from "./trpc";
import { toast } from "sonner";
import { useAuth } from "./auth-context";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  isVerified: boolean;
  isBanned?: boolean;
  banReason?: string;
  createdAt?: string;
}

export function useUsers() {
  const [isLoading, setIsLoading] = useState(false);
  const { refreshAuth, logout } = useAuth();
  const router = useRouter();

  // Get user by ID
  const getUserById = (id: string) => {
    return trpc.user.getById.useQuery(
      { id },
      {
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!id,
      }
    );
  };

  // Get all users (admin only)
  const getAllUsers = trpc.user.getAllUsers.useQuery(undefined, {
    staleTime: 1000 * 60, // 1 minute
  });

  // Login mutation
  const loginMutation = trpc.user.login.useMutation();

  // Register mutation
  const registerMutation = trpc.user.register.useMutation();

  // Set verified status mutation (admin only)
  const setVerifiedStatusMutation = trpc.user.setVerifiedStatus.useMutation();

  // Ban user mutation (admin only)
  const banUserMutation = trpc.user.banUser.useMutation();

  // Unban user mutation (admin only)
  const unbanUserMutation = trpc.user.unbanUser.useMutation();

  // Login a user
  const login = async (credentials: { username: string; password: string }) => {
    setIsLoading(true);
    try {
      const result = await loginMutation.mutateAsync(credentials);

      if (result.success) {
        toast.success("Login successful");

        // Store token in localStorage
        if (result.token) {
          localStorage.setItem("authToken", result.token);
          await refreshAuth();
          router.push("/");
        }

        return result;
      } else {
        toast.error(result.message || "Login failed");
        return result;
      }
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error(
        `Login failed: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register a new user
  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    setIsLoading(true);
    try {
      const result = await registerMutation.mutateAsync(userData);

      if (result.success) {
        toast.success("Registration successful");

        // Store token in localStorage
        if (result.token) {
          localStorage.setItem("authToken", result.token);
          await refreshAuth();
          router.push("/");
        }

        return result;
      } else {
        toast.error(result.message || "Registration failed");
        return result;
      }
    } catch (error) {
      console.error("Error registering:", error);
      toast.error(
        `Registration failed: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout a user
  const logoutUser = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  // Admin: Set verified status
  const setVerifiedStatus = async (userId: string, isVerified: boolean) => {
    setIsLoading(true);
    try {
      const result = await setVerifiedStatusMutation.mutateAsync({
        userId,
        isVerified,
      });

      toast.success(
        isVerified
          ? "User verified successfully"
          : "User unverified successfully"
      );

      return result;
    } catch (error) {
      console.error("Error setting verified status:", error);
      toast.error(
        `Failed to update verification status: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Admin: Ban a user
  const banUser = async (userId: string, reason: string) => {
    setIsLoading(true);
    try {
      const result = await banUserMutation.mutateAsync({
        userId,
        reason,
      });

      toast.success("User banned successfully");
      return result;
    } catch (error) {
      console.error("Error banning user:", error);
      toast.error(
        `Failed to ban user: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Admin: Unban a user
  const unbanUser = async (userId: string) => {
    setIsLoading(true);
    try {
      const result = await unbanUserMutation.mutateAsync({
        userId,
      });

      toast.success("User unbanned successfully");
      return result;
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast.error(
        `Failed to unban user: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    // Queries
    getUserById,
    getAllUsers,
    // Mutations
    login,
    register,
    logoutUser,
    setVerifiedStatus,
    banUser,
    unbanUser,
  };
}
