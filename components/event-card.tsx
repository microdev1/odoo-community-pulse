"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Event } from "@/server/db/events-db";

interface EventCardProps {
  event: Event;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  // Format date to display nicely
  const formatEventDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(new Date(date));
  };

  return (
    <Link href={`/events/${event.id}`}>
      <div
        className={cn(
          "group relative h-64 w-full overflow-hidden rounded-lg shadow-md transition-all hover:shadow-lg",
          className
        )}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundImage: `url(${event.imageUrl})` }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center justify-between mb-1">
            <span className="inline-block rounded bg-primary/90 px-2 py-1 text-xs font-medium">
              {event.category}
            </span>
            <span
              className={`inline-block rounded px-2 py-1 text-xs font-medium ${event.isFree ? "bg-green-500/90" : "bg-amber-500/90"}`}
            >
              {event.isFree
                ? "Free"
                : event.ticketTiers && event.ticketTiers.length > 0
                  ? event.ticketTiers.length > 1
                    ? `From $${Math.min(...event.ticketTiers.map((t) => t.price)).toFixed(2)}`
                    : `$${event.ticketTiers[0].price.toFixed(2)}`
                  : "$0.00"}
              {!event.isFree &&
                event.ticketTiers &&
                event.ticketTiers.length > 1 && (
                  <span className="ml-1 text-[10px]">
                    ({event.ticketTiers.length} tiers)
                  </span>
                )}
            </span>
          </div>
          <h3 className="mb-1 text-lg font-bold">{event.title}</h3>
          <p className="mb-2 line-clamp-2 text-sm opacity-90">
            {event.shortDescription || event.description.substring(0, 100)}
          </p>
          <div className="flex items-center justify-between text-xs opacity-80">
            <span>{formatEventDate(event.date)}</span>
            <span>{event.location.address.split(",")[0]}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
