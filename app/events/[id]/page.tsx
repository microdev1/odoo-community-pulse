"use client";

import { Header } from "@/components/header";
import { useQuery } from "@tanstack/react-query";
import { EventDetailClientEnhanced } from "./event-detail-client";
import { useParams } from "next/navigation";
import { EventService } from "@/lib/event-service";
import { Event } from "@/lib/events-db";

export default function EventPage() {
  const params = useParams();
  const id = params.id as string;

  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event", id],
    queryFn: () => EventService.getEventById(id),
  }) as { data: Event | undefined; isLoading: boolean; error: Error | null };

  // Helper functions for formatting
  const formatDate = (dateStr: string | Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateStr));
  };

  const formatTime = (dateStr: string | Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(dateStr));
  };

  // Calculate event duration
  const getEventDuration = (event: Event) => {
    if (!event.endDate) return formatTime(event.date);
    return `${formatTime(event.date)} - ${formatTime(event.endDate)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p>Event not found or error loading event details.</p>
        </div>
      </div>
    );
  }

  // Ensure we're working with a proper Event object
  if (!event || !event.date) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p>Invalid event data.</p>
        </div>
      </div>
    );
  }

  // Convert date strings to Date objects if necessary
  const eventObj = {
    ...event,
    date: new Date(event.date),
    endDate: event.endDate ? new Date(event.endDate) : undefined,
    registrationDeadline: event.registrationDeadline
      ? new Date(event.registrationDeadline)
      : undefined,
    createdAt: new Date(event.createdAt),
    updatedAt: event.updatedAt ? new Date(event.updatedAt) : undefined,
  };

  const eventDate = formatDate(eventObj.date);
  const eventTime = getEventDuration(eventObj);

  return (
    <div className="min-h-screen">
      <Header />
      <EventDetailClientEnhanced
        event={eventObj}
        formattedDate={eventDate}
        formattedTime={eventTime}
      />
    </div>
  );
}
