import { events } from "@/server/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type DbEvent = InferSelectModel<typeof events>;

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  description: string | null;
}

export interface EventWithDetails extends Omit<DbEvent, "organizer"> {
  organizer?: {
    id: string;
    username: string;
    email: string;
    phone?: string | null;
    isAdmin?: boolean | null;
    isVerified?: boolean | null;
    isBanned?: boolean | null;
    banReason?: string | null;
    createdAt?: string | null;
  };
  ticketTiers?: TicketTier[];
  isFlagged?: boolean;
  flagReason?: string;
}
