import { Header } from "@/components/header";
import { getEventById } from "@/lib/server-events";
import { EventDetailClient } from "./event-detail-client";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

interface EventPageProps {
  params: {
    id: string;
  };
}

export default async function EventPage({ params }: EventPageProps) {
  // Await params before destructuring to comply with Next.js 15
  const { id } = await params;
  // Force revalidation of this path to ensure fresh data
  revalidatePath(`/events/${id}`);
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(date));
  };

  // Calculate event duration
  const getEventDuration = () => {
    if (!event.endDate) return formatTime(event.date);

    return `${formatTime(event.date)} - ${formatTime(event.endDate)}`;
  };

  const eventDate = formatDate(event.date);
  const eventTime = getEventDuration();

  return (
    <div className="min-h-screen">
      <Header />
      <EventDetailClient
        event={event}
        formattedDate={eventDate}
        formattedTime={eventTime}
      />
    </div>
  );
}
