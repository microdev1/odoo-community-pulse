"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useUserRegisteredEvents } from "@/lib/event-hooks";

export default function RegisteredEventsPage() {
  const { user, isAuthenticated } = useAuth();
  const { data: events, isLoading } = useUserRegisteredEvents(user?.id || "");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto flex flex-col items-center justify-center px-4 py-16">
          <h1 className="mb-4 text-2xl font-bold">Login Required</h1>
          <p className="mb-6 text-center">
            Please login to view your registered events
          </p>
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
        <h1 className="mb-6 text-3xl font-bold">Registered Events</h1>

        {isLoading ? (
          <p>Loading your registered events...</p>
        ) : events?.length === 0 ? (
          <div className="rounded-lg border p-6 text-center">
            <h2 className="mb-2 text-xl font-medium">No registrations found</h2>
            <p className="mb-4">You haven't registered for any events yet.</p>
            <Button asChild>
              <Link href="/">Browse Events</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events?.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        )}
      </main>
    </div>
  );
}
