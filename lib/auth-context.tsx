"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { trpc } from "./trpc";

// Define the user type
export type User = {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  isAdmin: boolean | null;
  isVerified: boolean | null;
};

// Define the auth context type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => void;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  refreshAuth: async () => {},
  logout: () => {},
});

// Provider component that wraps the app and makes auth available
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { mutateAsync: getCurrentUser } =
    trpc.user.getCurrentUser.useMutation();

  // Function to set auth token securely
  const setAuthToken = (token: string | null) => {
    if (token) {
      // Set httpOnly cookie with secure attributes
      document.cookie = `authToken=${token}; path=/; secure; samesite=strict; max-age=604800`; // 7 days
    } else {
      // Remove the cookie
      document.cookie =
        "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=strict";
    }
  };

  // Function to get auth token from cookie
  const getAuthToken = (): string | null => {
    return (
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1] || null
    );
  };

  // Function to refresh the auth state
  const refreshAuth = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();

      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Get the current user with the token
      const result = await getCurrentUser({ token });

      if (result.success && "user" in result) {
        setUser(result.user);
      } else {
        // If no user was returned, clear the token
        setAuthToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Error refreshing auth:", error);
      // Clear token and user state on error
      setAuthToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to log out
  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  // On first render, check if we have a token and get the user
  useEffect(() => {
    refreshAuth();
  }, []);

  // Value for the context provider
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    refreshAuth,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook for components to get the auth context
export const useAuth = () => useContext(AuthContext);
