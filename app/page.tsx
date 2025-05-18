import { Suspense } from "react";
import { Header } from "@/components/header";
import { getApprovedEvents } from "@/lib/events-db";
import { EventCard } from "@/components/event-card";

async function EventsList() {
  const events = await getApprovedEvents();

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Community Events</h1>
        <Suspense fallback={<p>Loading events...</p>}>
          <EventsList />
        </Suspense>
      </main>
    </div>
  );
}
