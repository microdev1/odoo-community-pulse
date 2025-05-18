"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Event,
  getAllEvents,
  approveEvent,
  deleteEvent,
} from "@/lib/events-db";

export default function AdminPage() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "all">(
    "pending"
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect non-admins
    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push("/");
    }

    async function fetchEvents() {
      if (isAdmin) {
        setIsLoading(true);
        try {
          const allEvents = await getAllEvents();
          setEvents(allEvents);
        } catch (error) {
          console.error("Failed to fetch events:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (isAuthenticated) {
      fetchEvents();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAdmin, router]);

  const handleApproveEvent = async (eventId: string) => {
    try {
      await approveEvent(eventId);
      // Update the local state
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId ? { ...event, isApproved: true } : event
        )
      );
    } catch (error) {
      console.error("Failed to approve event:", error);
      alert("Failed to approve event");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteEvent(eventId);
      // Update the local state
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Failed to delete event");
    }
  };

  const filteredEvents =
    activeTab === "all"
      ? events
      : activeTab === "approved"
        ? events.filter((event) => event.isApproved)
        : events.filter((event) => !event.isApproved);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto flex flex-col items-center justify-center px-4 py-16">
          <h1 className="mb-4 text-2xl font-bold">Admin Access Required</h1>
          <p className="mb-6 text-center">Please login with an admin account</p>
          <Button asChild>
            <a href="/auth">Login</a>
          </Button>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>

        <div className="mb-6">
          <div className="flex space-x-2 border-b">
            <button
              className={`px-4 py-2 ${activeTab === "pending" ? "border-b-2 border-primary font-medium" : ""}`}
              onClick={() => setActiveTab("pending")}
            >
              Pending Approval
            </button>
            <button
              className={`px-4 py-2 ${activeTab === "approved" ? "border-b-2 border-primary font-medium" : ""}`}
              onClick={() => setActiveTab("approved")}
            >
              Approved Events
            </button>
            <button
              className={`px-4 py-2 ${activeTab === "all" ? "border-b-2 border-primary font-medium" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Events
            </button>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <p>No events found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Event
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Organizer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={event.imageUrl}
                            alt={event.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">
                            {event.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {event.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {event.organizer.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {event.organizer.email}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {event.isApproved ? (
                        <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/events/${event.id}`}>View</a>
                        </Button>

                        {!event.isApproved && (
                          <Button
                            size="sm"
                            onClick={() => handleApproveEvent(event.id)}
                          >
                            Approve
                          </Button>
                        )}

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
