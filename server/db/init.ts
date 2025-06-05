"use server";

import { db, schema } from ".";
import { ServerUserService } from "@/server/services/user-service";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";

async function initializeDatabase() {
  console.log("Initializing database...");

  try {
    // Verify database connection by selecting from the users table
    try {
      await db.select().from(schema.users).limit(1);
      console.log("Database connection verified.");
    } catch (error) {
      throw new Error(
        `Failed to connect to database: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    // Create an admin user if it doesn't exist
    const users = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, "admin"));
    const adminExists = users.length > 0;

    if (!adminExists) {
      console.log("Creating admin user...");
      const adminId = createId();

      if (!process.env.ADMIN_PASSWORD) {
        throw new Error("ADMIN_PASSWORD environment variable is not set");
      }

      const hashedPassword = ServerUserService.hashPassword(
        process.env.ADMIN_PASSWORD
      );

      await db.insert(schema.users).values({
        id: adminId,
        username: "admin",
        email: process.env.ADMIN_EMAIL || "admin@example.com",
        password: hashedPassword,
        isAdmin: true,
        isVerified: true,
      });
      console.log("Admin user created with ID:", adminId);
    } else {
      console.log("Admin user already exists, skipping creation.");
    }

    // Verify admin user was created successfully
    const adminUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, "admin"))
      .limit(1);

    if (!adminUser.length) {
      throw new Error("Failed to verify admin user creation");
    }

    console.log("Database initialization completed successfully.");
    return { success: true, message: "Database initialized successfully" };
  } catch (error) {
    console.error("Error initializing database:", error);
    return {
      success: false,
      message: `Error initializing database: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

console.log(initializeDatabase());
