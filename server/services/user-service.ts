"use server";

// User interface definition
export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  password: string; // In a real app, this would be hashed
  isAdmin: boolean;
  isVerifiedOrganizer?: boolean;
  isBanned?: boolean;
  banReason?: string;
  bannedAt?: Date;
  createdAt: Date;
}

// Authentication response interface (excluding sensitive data)
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: Omit<User, "password">;
  token?: string;
}

// Mock users database - in a real app, this would be in a database
const users: User[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@example.com",
    password: "admin123", // In a real app, this would be hashed
    isAdmin: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    username: "user1",
    email: "user1@example.com",
    phone: "+1234567890",
    password: "password123", // In a real app, this would be hashed
    isAdmin: false,
    createdAt: new Date("2024-01-15"),
  },
];

// Server-side implementation of the UserService
export const ServerUserService = {
  // Get user by ID (exclude password)
  getUserById: async (id: string): Promise<Omit<User, "password"> | null> => {
    const user = users.find((u) => u.id === id);
    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Get all users (exclude passwords) - admin only
  getAllUsers: async (): Promise<Omit<User, "password">[]> => {
    return users.map(
      ({ password, ...userWithoutPassword }) => userWithoutPassword
    );
  },

  // Authentication for login
  loginUser: async (
    username: string,
    password: string
  ): Promise<AuthResponse> => {
    const user = users.find((u) => u.username === username);

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    if (user.password !== password) {
      return {
        success: false,
        message: "Invalid password",
      };
    }

    if (user.isBanned) {
      return {
        success: false,
        message: `Your account has been banned. Reason: ${user.banReason || "Violation of terms"}`,
      };
    }

    const { password: _password, ...userWithoutPassword } = user;

    return {
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
      token: `server-jwt-token-${user.id}-${Date.now()}`,
    };
  },

  // Registration for signup
  registerUser: async (userData: {
    username: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<AuthResponse> => {
    // Check if username already exists
    if (users.some((u) => u.username === userData.username)) {
      return {
        success: false,
        message: "Username already exists",
      };
    }

    // Check if email already exists
    if (users.some((u) => u.email === userData.email)) {
      return {
        success: false,
        message: "Email already exists",
      };
    }

    // Create new user
    const newUser: User = {
      id: (users.length + 1).toString(),
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      isAdmin: false, // New users are not admins by default
      createdAt: new Date(),
    };

    // Add to database
    users.push(newUser);

    const { password: _password, ...userWithoutPassword } = newUser;

    return {
      success: true,
      message: "Registration successful",
      user: userWithoutPassword,
      token: `server-jwt-token-${newUser.id}-${Date.now()}`,
    };
  },

  // Function to validate token and get current user
  getCurrentUser: async (
    token?: string
  ): Promise<Omit<User, "password"> | null> => {
    if (!token) return null;

    // In a real app, we would validate the JWT token
    // For demonstration purposes, we'll extract the user ID from the token format
    const match = token.match(/server-jwt-token-(\d+)-\d+/);
    if (!match) return null;

    const userId = match[1];
    const user = users.find((u) => u.id === userId);

    if (!user) return null;
    if (user.isBanned) return null;

    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Admin function to set verified organizer status
  setUserVerifiedStatus: async (
    userId: string,
    isVerified: boolean
  ): Promise<boolean> => {
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return false;
    }

    users[userIndex] = {
      ...users[userIndex],
      isVerifiedOrganizer: isVerified,
    };

    return true;
  },

  // Admin function to ban a user
  banUser: async (userId: string, reason: string): Promise<boolean> => {
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return false;
    }

    users[userIndex] = {
      ...users[userIndex],
      isBanned: true,
      banReason: reason,
      bannedAt: new Date(),
    };

    return true;
  },

  // Admin function to unban a user
  unbanUser: async (userId: string): Promise<boolean> => {
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return false;
    }

    users[userIndex] = {
      ...users[userIndex],
      isBanned: false,
      banReason: undefined,
      bannedAt: undefined,
    };

    return true;
  },
};
