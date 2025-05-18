"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useUserEvents } from "@/lib/event-hooks";

export default function MyEventsPage() {
  const { user, isAuthenticated } = useAuth();
  const { data: events, isLoading, error } = useUserEvents(user?.id || "");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto flex flex-col items-center justify-center px-4 py-16">
          <h1 className="mb-4 text-2xl font-bold">Login Required</h1>
          <p className="mb-6 text-center">Please login to view your events</p>
          <Button asChild>
            <Link href="/auth">Login</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Events</h1>
          <Button asChild>
            <Link href="/create-event">Create New Event</Link>
          </Button>
        </div>

        {isLoading ? (
          <p>Loading your events...</p>
        ) : events?.length === 0 ? (
          <div className="rounded-lg border p-6 text-center">
            <h2 className="mb-2 text-xl font-medium">No events found</h2>
            <p className="mb-4">You haven't created any events yet.</p>
            <Button asChild>
              <Link href="/create-event">Create Your First Event</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events?.map((event) => (
              <div key={event.id} className="flex flex-col">
                <EventCard event={event} />
                <div className="mt-2 text-sm">
                  <span
                    className={`rounded-full px-2 py-1 font-medium ${
                      event.isApproved
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {event.isApproved ? "Approved" : "Awaiting Approval"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
