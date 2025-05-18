// Mock database for user authentication

// User interface definition
export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  password: string; // In a real app, this would be hashed
  isAdmin: boolean;
  createdAt: Date;
}

// Mock users database
export const users: User[] = [
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

// Authentication response interface
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: Omit<User, "password">;
  token?: string;
}

// Mock authentication function for login
export async function loginUser(
  username: string,
  password: string
): Promise<AuthResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

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

  const { password: _password, ...userWithoutPassword } = user;

  return {
    success: true,
    message: "Login successful",
    user: userWithoutPassword,
    token: `mock-jwt-token-${user.id}-${Date.now()}`,
  };
}

// Mock registration function for signup
export async function registerUser(userData: {
  username: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<AuthResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

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

  // Add to mock database
  users.push(newUser);

  const { password: _password, ...userWithoutPassword } = newUser;

  return {
    success: true,
    message: "Registration successful",
    user: userWithoutPassword,
    token: `mock-jwt-token-${newUser.id}-${Date.now()}`,
  };
}

// Function to get current authenticated user (for demonstration purposes)
export async function getCurrentUser(
  token?: string
): Promise<Omit<User, "password"> | null> {
  if (!token) return null;

  // In a real app, we would validate the JWT token
  // For mock purposes, we'll extract the user ID from the token format
  const match = token.match(/mock-jwt-token-(\d+)-\d+/);
  if (!match) return null;

  const userId = match[1];
  const user = users.find((u) => u.id === userId);

  if (!user) return null;

  const { password: _password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
