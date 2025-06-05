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
  phone?: string;
  isAdmin: boolean;
  isVerified: boolean;
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

  // Use the getCurrentUser query
  const { mutateAsync: getCurrentUser } =
    trpc.user.getCurrentUser.useMutation();

  // Function to refresh the auth state
  const refreshAuth = async () => {
    setIsLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem("authToken");

      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Get the current user with the token
      const result = await getCurrentUser({ token });

      if (result?.user) {
        setUser(result.user);
      } else {
        // If no user was returned, clear the token
        localStorage.removeItem("authToken");
        setUser(null);
      }
    } catch (error) {
      console.error("Error refreshing auth:", error);
      localStorage.removeItem("authToken");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to log out
  const logout = () => {
    localStorage.removeItem("authToken");
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
