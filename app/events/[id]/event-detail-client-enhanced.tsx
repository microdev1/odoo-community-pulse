"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Event, EventRegistration } from "@/lib/events-db";
import { EventService } from "@/lib/event-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationMap } from "@/components/location-map";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EventDetailClientProps {
  event: Event;
  formattedDate: string;
  formattedTime: string;
}

export function EventDetailClientEnhanced({
  event,
  formattedDate,
  formattedTime,
}: EventDetailClientProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [attendees, setAttendees] = useState(1);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const isOrganizer = user?.id === event.organizer.id;

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: (data: {
      eventId: string;
      userId: string;
      attendees: number;
    }) => {
      return EventService.registerForEvent({
        eventId: data.eventId,
        userId: data.userId,
        name: user!.username,
        email: user!.email,
        phone: user?.phone || "",
        attendees: data.attendees,
      });
    },
    onSuccess: () => {
      setRegistrationSuccess(true);
      toast.success("Registration successful! You're all set.");
    },
    onError: (error) => {
      toast.error("Failed to register. Please try again.");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (eventId: string) => {
      return EventService.deleteEvent(eventId);
    },
    onSuccess: () => {
      toast.success("Event deleted successfully");
      router.push("/my-events");
    },
    onError: () => {
      toast.error("Failed to delete event");
    },
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push(`/auth?redirect=/events/${event.id}`);
      return;
    }

    registerMutation.mutate({
      eventId: event.id,
      userId: user.id,
      attendees,
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(event.id);
  };

  return (
    <main>
      {/* Hero Section */}
      <div
        className="h-64 bg-cover bg-center md:h-80"
        style={{ backgroundImage: `url(${event.imageUrl})` }}
      >
        <div className="container flex h-full items-end px-4 pb-8">
          <div className="bg-background/80 p-4 backdrop-blur-sm md:max-w-2xl">
            <h1 className="text-2xl font-bold md:text-4xl">{event.title}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2">
            <p className="mb-6 text-lg">{event.description}</p>

            {/* Map Component */}
            <div className="mt-8">
              <h2 className="mb-4 text-xl font-semibold">Location</h2>
              <LocationMap
                latitude={event.location.latitude}
                longitude={event.location.longitude}
                address={event.location.address}
                height="300px"
                className="rounded-lg border"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="rounded-lg border p-4 shadow-sm">
            {/* Registration Status */}
            {registrationSuccess ? (
              <div className="mb-6 rounded-md bg-green-50 p-4 text-green-800">
                <p className="font-medium">You're registered!</p>
                <p className="mt-1 text-sm">
                  You'll receive a confirmation email shortly.
                </p>
              </div>
            ) : isRegistering ? (
              <form onSubmit={handleRegister} className="mb-6 space-y-4">
                <h3 className="text-lg font-medium">Register for this event</h3>
                <div>
                  <Label htmlFor="attendees">Number of attendees</Label>
                  <Input
                    id="attendees"
                    type="number"
                    min="1"
                    max="10"
                    value={attendees}
                    onChange={(e) => setAttendees(parseInt(e.target.value))}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full"
                >
                  {registerMutation.isPending
                    ? "Registering..."
                    : "Complete Registration"}
                </Button>
              </form>
            ) : (
              <Button
                onClick={() => setIsRegistering(true)}
                className="mb-6 w-full"
                disabled={!isAuthenticated}
              >
                {isAuthenticated ? "Register Now" : "Login to Register"}
              </Button>
            )}

            {/* Event Details */}
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Date & Time</h3>
                <p>{formattedDate}</p>
                <p>{formattedTime}</p>
              </div>

              <div>
                <h3 className="font-medium">Location</h3>
                <p>{event.location.address}</p>
              </div>

              <div>
                <h3 className="font-medium">Category</h3>
                <p>{event.category}</p>
              </div>

              <div>
                <h3 className="font-medium">Organizer</h3>
                <p>{event.organizer.name}</p>
                <p>{event.organizer.email}</p>
                {event.organizer.phone && <p>{event.organizer.phone}</p>}
              </div>

              {event.registrationDeadline && (
                <div>
                  <h3 className="font-medium">Registration Deadline</h3>
                  <p>
                    {new Date(event.registrationDeadline).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Actions for event organizer */}
              {isOrganizer && (
                <div className="mt-6 flex flex-col space-y-2">
                  <Link href={`/events/${event.id}/edit`}>
                    <Button variant="outline" className="w-full">
                      Edit Event
                    </Button>
                  </Link>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        Delete Event
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the event and remove all registrations.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                          {deleteMutation.isPending
                            ? "Deleting..."
                            : "Yes, delete event"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
