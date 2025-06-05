#!/usr/bin/env node

/**
 * This script handles database migrations for the Community Pulse application.
 * It uses Drizzle ORM to apply migrations and keep the database schema up-to-date.
 */

import { migrate } from "drizzle-orm/libsql/migrator";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const runMigrations = async () => {
  console.log("Starting database migrations...");

  // Get database connection details from environment variables
  const dbUrl = process.env.DATABASE_URL;
  const dbAuthToken = process.env.DATABASE_AUTH_TOKEN;

  if (!dbUrl) {
    console.error("Error: DATABASE_URL environment variable is not set.");
    process.exit(1);
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${MAX_RETRIES} to run migrations...`);

      // Create a database client
      const client = createClient({
        url: dbUrl,
        authToken: dbAuthToken,
      });

      // Test the connection
      await client.execute("SELECT 1");

      // Initialize Drizzle with the client
      const db = drizzle(client);

      // Run migrations from the ./drizzle folder
      console.log("Applying migrations...");
      await migrate(db, {
        migrationsFolder: "./drizzle",
      });

      console.log("Migrations completed successfully! ✅");
      return process.exit(0);
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
        await wait(RETRY_DELAY);
      }
    }
  }

  console.error("All migration attempts failed!");
  console.error("Last error:", lastError);
  process.exit(1);
};

// Run the migrations
runMigrations();
