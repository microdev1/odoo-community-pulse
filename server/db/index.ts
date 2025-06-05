import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Database URL from environment variable or use a local file for development
const url = process.env.DATABASE_URL || "file:local.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;

// Create the client
const client = createClient({ url, authToken });

// Create the database connection with the schema
export const db = drizzle(client, { schema });

// Export the schema for use in other files
export { schema };
