"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Event,
  EventRegistration,
  registerForEvent,
  deleteEvent,
} from "@/lib/events-db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EventDetailClientProps {
  event: Event;
  formattedDate: string;
  formattedTime: string;
}

export function EventDetailClient({
  event,
  formattedDate,
  formattedTime,
}: EventDetailClientProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [attendees, setAttendees] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );

  const isOrganizer = user?.id === event.organizer.id;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push(`/auth?redirect=/events/${event.id}`);
      return;
    }

    setIsSubmitting(true);
    setRegistrationError(null);

    try {
      await registerForEvent(event.id, {
        userId: user.id,
        name: user.username,
        email: user.email,
        phone: user.phone,
        additionalAttendees: attendees - 1, // Subtract the user
      });

      setRegistrationSuccess(true);
      setIsRegistering(false);
    } catch (error: any) {
      setRegistrationError(error.message || "Failed to register for event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteEvent(event.id);
      router.push("/my-events");
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Failed to delete event. Please try again.");
    }
  };

  return (
    <main>
      {/* Event header/hero image */}
      <div
        className="relative h-64 w-full bg-cover bg-center md:h-96"
        style={{ backgroundImage: `url(${event.imageUrl})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="container absolute bottom-0 left-0 right-0 p-6">
          <span className="inline-block rounded-full bg-primary px-3 py-1 text-sm text-white">
            {event.category}
          </span>
          <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Event content */}
      <div className="container py-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row">
          {/* Main content */}
          <div className="flex-1">
            <div className="prose max-w-none">
              <p className="text-lg">{event.description}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80">
            <div className="rounded-lg border bg-card p-4 shadow">
              {registrationSuccess ? (
                <div className="mb-4 rounded bg-green-50 p-3 text-sm text-green-600">
                  You're registered for this event!
                </div>
              ) : (
                <>
                  {registrationError && (
                    <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-500">
                      {registrationError}
                    </div>
                  )}

                  {isOrganizer ? (
                    <div className="flex flex-col gap-3">
                      <Button asChild className="w-full">
                        <Link href={`/events/${event.id}/edit`}>
                          Edit Event
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleDeleteEvent}
                      >
                        Delete Event
                      </Button>
                    </div>
                  ) : (
                    <>
                      {!isRegistering ? (
                        <Button
                          className="w-full"
                          onClick={() => setIsRegistering(true)}
                        >
                          Register for this event
                        </Button>
                      ) : (
                        <form
                          onSubmit={handleRegister}
                          className="flex flex-col gap-3"
                        >
                          <div>
                            <Label htmlFor="attendees">
                              Number of attendees
                            </Label>
                            <Input
                              id="attendees"
                              type="number"
                              min="1"
                              value={attendees}
                              onChange={(e) =>
                                setAttendees(parseInt(e.target.value))
                              }
                              required
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              className="flex-1"
                              disabled={isSubmitting}
                            >
                              {isSubmitting
                                ? "Registering..."
                                : "Confirm Registration"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsRegistering(false)}
                              disabled={isSubmitting}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      )}
                    </>
                  )}
                </>
              )}

              <hr className="my-4" />

              <div className="flex flex-col gap-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Date
                  </h3>
                  <p>{formattedDate}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Time
                  </h3>
                  <p>{formattedTime}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Location
                  </h3>
                  <p>{event.location.address}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Organizer
                  </h3>
                  <p>{event.organizer.name}</p>
                  {event.organizer.email && (
                    <p className="text-sm">{event.organizer.email}</p>
                  )}
                  {event.organizer.phone && (
                    <p className="text-sm">{event.organizer.phone}</p>
                  )}
                </div>
                {event.registrationDeadline && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Registration Deadline
                    </h3>
                    <p>
                      {new Date(event.registrationDeadline).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
