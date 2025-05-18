"use client";

import { Header } from "@/components/header";
import { useQuery } from "@tanstack/react-query";
import { EventDetailClientEnhanced } from "./event-detail-client-enhanced";
import { notFound, useParams } from "next/navigation";
import { EventService } from "@/lib/event-service";
import { format } from "date-fns";

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
  });

  // Helper functions for formatting
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(date));
  };

  // Calculate event duration
  const getEventDuration = (event: any) => {
    if (!event.endDate) return formatTime(event.date);
    return `${formatTime(event.date)} - ${formatTime(event.endDate)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container px-4 py-8">
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container px-4 py-8">
          <p>Event not found or error loading event details.</p>
        </div>
      </div>
    );
  }

  const eventDate = formatDate(event.date);
  const eventTime = getEventDuration(event);

  return (
    <div className="min-h-screen">
      <Header />
      <EventDetailClientEnhanced
        event={event}
        formattedDate={eventDate}
        formattedTime={eventTime}
      />
    </div>
  );
}
