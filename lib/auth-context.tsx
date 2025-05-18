"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getCurrentUser } from "@/lib/mock-db";

interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  logout: () => {},
  refreshAuth: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to load user data from token
  const loadUserFromToken = async (token: string): Promise<boolean> => {
    try {
      const userData = await getCurrentUser(token);

      if (userData) {
        setUser(userData);
        return true;
      } else {
        // Invalid token
        localStorage.removeItem("authToken");
        return false;
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      localStorage.removeItem("authToken");
      return false;
    }
  };

  // Function to refresh auth state - can be called after successful login/signup
  const refreshAuth = async (): Promise<void> => {
    setIsLoading(true);
    const token = localStorage.getItem("authToken");

    if (token) {
      await loadUserFromToken(token);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    // Check for saved token on initial load
    const token = localStorage.getItem("authToken");

    if (token) {
      loadUserFromToken(token).finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
