"use server";

import { db, schema } from "../db";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";

// Ensure the JWT secret is set
const JWT_SECRET = process.env.JWT_SECRET || "development-secret-key";

export class ServerUserService {
  // Hash a password
  static hashPassword(password: string): string {
    // In production, use a proper password hashing library like bcrypt
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");
    return `${salt}:${hash}`;
  }

  // Verify a password
  static verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, storedHash] = hashedPassword.split(":");
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");
    return storedHash === hash;
  }

  // Generate a JWT token
  static generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, {
      expiresIn: "7d",
    });
  }

  // Verify a JWT token
  static verifyToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded;
    } catch (err) {
      return null;
    }
  }

  // Register a new user
  static async registerUser(userData: {
    username: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    // Check if the username or email already exists
    const existingUser = await db.query.users.findFirst({
      where: (users) =>
        eq(users.username, userData.username) ||
        eq(users.email, userData.email),
    });

    if (existingUser) {
      return {
        success: false,
        message:
          existingUser.username === userData.username
            ? "Username already exists"
            : "Email already exists",
      };
    }

    // Create the user
    const userId = createId();
    const hashedPassword = this.hashPassword(userData.password);

    await db.insert(schema.users).values({
      id: userId,
      username: userData.username,
      email: userData.email,
      phone: userData.phone || null,
      password: hashedPassword,
    });

    // Generate a token
    const token = this.generateToken(userId);

    return {
      success: true,
      message: "User created successfully",
      token,
      userId,
    };
  }

  // Login a user
  static async loginUser(credentials: { username: string; password: string }) {
    // Find the user
    const user = await db.query.users.findFirst({
      where: (users) => eq(users.username, credentials.username),
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid username or password",
      };
    }

    // Check if the user is banned
    if (user.isBanned) {
      return {
        success: false,
        message: `Your account has been banned. Reason: ${user.banReason || "Violation of terms"}`,
      };
    }

    // Verify the password
    if (!this.verifyPassword(credentials.password, user.password)) {
      return {
        success: false,
        message: "Invalid username or password",
      };
    }

    // Generate a token
    const token = this.generateToken(user.id);

    return {
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
      },
    };
  }

  // Get current user from token
  static async getCurrentUser(token: string) {
    // Verify the token
    const decoded = this.verifyToken(token);
    if (!decoded) {
      return {
        success: false,
        message: "Invalid token",
      };
    }

    // Find the user
    const user = await db.query.users.findFirst({
      where: (users) => eq(users.id, decoded.userId),
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Check if the user is banned
    if (user.isBanned) {
      return {
        success: false,
        message: `Your account has been banned. Reason: ${user.banReason || "Violation of terms"}`,
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
      },
    };
  }

  // Get all users (admin only)
  static async getAllUsers() {
    const users = await db.query.users.findMany({
      orderBy: (users) => users.username,
    });

    return users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      isBanned: user.isBanned,
      banReason: user.banReason,
      createdAt: user.createdAt,
    }));
  }

  // Set verified status (admin only)
  static async setVerifiedStatus(userId: string, isVerified: boolean) {
    await db
      .update(schema.users)
      .set({ isVerified })
      .where(eq(schema.users.id, userId));

    return {
      success: true,
      message: `User ${isVerified ? "verified" : "unverified"} successfully`,
    };
  }

  // Ban a user (admin only)
  static async banUser(userId: string, reason: string) {
    await db
      .update(schema.users)
      .set({ isBanned: true, banReason: reason })
      .where(eq(schema.users.id, userId));

    return {
      success: true,
      message: "User banned successfully",
    };
  }

  // Unban a user (admin only)
  static async unbanUser(userId: string) {
    await db
      .update(schema.users)
      .set({ isBanned: false, banReason: null })
      .where(eq(schema.users.id, userId));

    return {
      success: true,
      message: "User unbanned successfully",
    };
  }
}
