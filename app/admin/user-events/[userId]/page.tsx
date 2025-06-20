"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Header } from "@/components/header";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { Event } from "@/lib/event-hooks";

interface UserEventsPageProps {
  params: {
    userId: string;
  };
}

export default function UserEventsPage({ params }: UserEventsPageProps) {
  const { userId } = params;
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load events and user data
  const { data: eventsData, isLoading: isLoadingEvents } = trpc.event.getUserEvents.useQuery(
    { userId },
    { enabled: !!(isAdmin && userId) }
  );

  const { data: userData, isLoading: isLoadingUser } = trpc.user.getById.useQuery(
    { id: userId },
    { enabled: !!(isAdmin && userId) }
  );

  const flagEventMutation = trpc.event.flagEvent.useMutation({
    onSuccess: (_, { id, reason }) => {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === id ? { ...event, isFlagged: true, flagReason: reason } : event
        )
      );
      toast.success("Event has been flagged. Notification sent to organizer.");
    },
    onError: (error) => {
      console.error("Failed to flag event:", error);
      toast.error("Failed to flag event");
    },
  });

  const unflagEventMutation = trpc.event.unflagEvent.useMutation({
    onSuccess: (_, { id }) => {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === id ? { ...event, isFlagged: false, flagReason: undefined } : event
        )
      );
      toast.success("Flag removed from event. Notification sent to organizer.");
    },
    onError: (error) => {
      console.error("Failed to unflag event:", error);
      toast.error("Failed to unflag event");
    },
  });

  const { data: eventsData } = trpc.event.getUserEvents.useQuery(
    { userId },
    { enabled: !!(isAdmin && userId) }
  );

  const { data: userData } = trpc.user.getById.useQuery(
    { id: userId },
    { enabled: !!(isAdmin && userId) }
  );

  useEffect(() => {
    // Redirect if no longer loading authentication state
    if (!isLoading) {
      // Redirect non-authenticated users to login
      if (!isAuthenticated) {
        router.push("/auth");
        return;
      }

      // Redirect non-admins to home
      if (!isAdmin) {
        router.push("/");
        return;
      }
    }

    if (eventsData) {
      setEvents(eventsData as Event[]);
    }

    if (userData) {
      setUserName(userData.username);
    }
        } catch (error) {
          console.error("Failed to fetch events:", error);
          toast.error("Failed to load user events");
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (isAuthenticated && isAdmin && userId) {
      fetchUserEvents();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAdmin, router, isLoading, userId]);

  const approveEventMutation = trpc.event.approveEvent.useMutation({
    onSuccess: (_, { id }) => {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === id ? { ...event, isApproved: true } : event
        )
      );
      toast.success("Event approved successfully! Notification sent to organizer.");
    },
    onError: (error) => {
      console.error("Failed to approve event:", error);
      toast.error("Failed to approve event");
    },
  });

  const handleApproveEvent = async (eventId: string) => {
    approveEventMutation.mutate({ id: eventId });
  };

  const rejectEventMutation = trpc.event.rejectEvent.useMutation({
    onSuccess: (_, { id }) => {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === id ? { ...event, isApproved: false } : event
        )
      );
      toast.success("Event rejected. Notification sent to organizer.");
    },
    onError: (error) => {
      console.error("Failed to reject event:", error);
      toast.error("Failed to reject event");
    },
  });

  const handleRejectEvent = async (eventId: string) => {
    rejectEventMutation.mutate({ id: eventId });
  };

  const deleteEventMutation = trpc.event.deleteEvent.useMutation({
    onSuccess: (_, { id }) => {
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== id)
      );
      toast.success(
        "Event deleted successfully! Notifications sent to all registered participants."
      );
    },
    onError: (error) => {
      console.error("Failed to delete event:", error);
      toast.error("Failed to delete event");
    },
  });

  const handleDeleteEvent = async (eventId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return;
    }

    deleteEventMutation.mutate({ id: eventId });
  };

  const handleFlagEvent = async (eventId: string) => {
    const reason = prompt("Please enter the reason for flagging this event:");
    if (!reason) return;
    flagEventMutation.mutate({ id: eventId, reason });
  };

  const handleUnflagEvent = async (eventId: string) => {
    unflagEventMutation.mutate({ id: eventId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <h1 className="mb-6 text-3xl font-bold">User Events</h1>
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">
          Events by {userName || `User #${userId}`}
        </h1>

        <div className="mb-6">
          <a href="/admin/users" className="text-blue-500 hover:underline">
            ← Back to Users
          </a>
        </div>

        {events.length === 0 ? (
          <p>No events found for this user.</p>
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
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className={event.isFlagged ? "bg-yellow-50" : ""}
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <Image
                            className="rounded-full object-cover"
                            src={event.imageUrl}
                            alt={event.title}
                            width={40}
                            height={40}
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
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        {event.isApproved ? (
                          <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800">
                            Pending
                          </span>
                        )}

                        {event.isFlagged && (
                          <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">
                            Flagged
                          </span>
                        )}
                      </div>
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

                        {event.isApproved && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectEvent(event.id)}
                          >
                            Reject
                          </Button>
                        )}

                        {event.isFlagged ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnflagEvent(event.id)}
                          >
                            Unflag
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFlagEvent(event.id)}
                          >
                            Flag
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
