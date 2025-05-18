"use client";

import { Header } from "@/components/header";
import { useSearchParams } from "next/navigation";
import { useSearchEvents } from "@/lib/event-hooks";
import { EventCard } from "@/components/event-card";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const { data: events, isLoading, error } = useSearchEvents(query);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">
          Search Results for "{query}"
        </h1>

        {isLoading ? (
          <p>Searching...</p>
        ) : error ? (
          <p>Error searching events. Please try again.</p>
        ) : !events || events.length === 0 ? (
          <p>No events found matching your search.</p>
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
