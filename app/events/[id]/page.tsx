"use client";

import { Header } from "@/components/header";
import { EventDetailClientEnhanced } from "./event-detail-client";
import { useParams } from "next/navigation";
import { useEvent } from "@/lib/event-hooks";

export default function EventPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: event, isLoading, error } = useEvent(id);

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
  const getEventDuration = (event: {
    date: string;
    endDate?: string | null;
  }) => {
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

  // Format the dates without converting the entire object
  const eventDate = formatDate(new Date(event.date));
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
