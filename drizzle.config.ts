import type { Config } from "drizzle-kit";

export default {
  schema: "./server/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || "file:local.db",
  },
  strict: true,
} satisfies Config;
