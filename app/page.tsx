"use client";

import { Header } from "@/components/header";
import { EventCard } from "@/components/event-card";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { data: events, isLoading, error } = trpc.event.getAll.useQuery();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Community Events</h1>
        {isLoading ? (
          <p>Loading events...</p>
        ) : error ? (
          <p>Error loading events. Please try again later.</p>
        ) : !events || events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
