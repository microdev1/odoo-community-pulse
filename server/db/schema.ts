import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";

// User schema
export const users = sqliteTable("users", {
  id: text("id").primaryKey().notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  password: text("password").notNull(), // In production, ensure this is hashed
  isAdmin: integer("is_admin", { mode: "boolean" }).default(false),
  isVerified: integer("is_verified", { mode: "boolean" }).default(false),
  isBanned: integer("is_banned", { mode: "boolean" }).default(false),
  banReason: text("ban_reason"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Event schema
export const events = sqliteTable("events", {
  id: text("id").primaryKey().notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  imageUrl: text("image_url").notNull(),
  date: text("date").notNull(), // Store as ISO string
  endDate: text("end_date"), // Store as ISO string
  locationAddress: text("location_address").notNull(),
  locationLatitude: text("location_latitude", { mode: "decimal" }),
  locationLongitude: text("location_longitude", { mode: "decimal" }),
  category: text("category").notNull(),
  organizerId: text("organizer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  isFree: integer("is_free", { mode: "boolean" }).default(true),
  registrationDeadline: text("registration_deadline"), // Store as ISO string
  isApproved: integer("is_approved", { mode: "boolean" }).default(false),
  isRejected: integer("is_rejected", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Ticket Tier schema
export const ticketTiers = sqliteTable("ticket_tiers", {
  id: text("id").primaryKey().notNull(),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  price: integer("price").notNull(), // Store in cents
  description: text("description"),
});

// Registration schema
export const registrations = sqliteTable("registrations", {
  id: text("id").primaryKey().notNull(),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  additionalAttendees: integer("additional_attendees").default(0),
  ticketTierId: text("ticket_tier_id").references(() => ticketTiers.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Notification schema for tracking sent notifications
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "reminder", "update", etc.
  sentAt: text("sent_at").default(sql`CURRENT_TIMESTAMP`),
  sentVia: text("sent_via").notNull(), // "email", "sms", "whatsapp"
  isSuccess: integer("is_success", { mode: "boolean" }).default(false),
  errorMessage: text("error_message"),
});
