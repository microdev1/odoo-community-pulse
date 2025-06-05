"use client";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { useCancelRegistration } from "@/lib/event-hooks";
import type { TicketTier, Event } from "@/lib/events-db";
import { Label } from "@radix-ui/react-label";
import { Link } from "lucide-react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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
  const [selectedTicketTierId, setSelectedTicketTierId] = useState<
    string | undefined
  >(undefined);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const isOrganizer = user?.id === event.organizer.id;

  // Check if user is registered for this event
  const { data: isUserRegisteredResult } = trpc.event.isUserRegistered.useQuery(
    { eventId: event.id, userId: user?.id || "" },
    { enabled: !!user?.id && isAuthenticated }
  );

  useEffect(() => {
    if (isUserRegisteredResult !== undefined) {
      setIsRegistered(isUserRegisteredResult);
    }
  }, [isUserRegisteredResult]);

  // Registration mutation
  const registerMutation = trpc.event.registerForEvent.useMutation({
    onSuccess: () => {
      setRegistrationSuccess(true);
      toast.success("Registration successful! You're all set.");
    },
    onError: () => {
      toast.error("Failed to register. Please try again.");
    },
  });

  // Delete mutation
  const deleteMutation = trpc.event.deleteEvent.useMutation({
    onSuccess: () => {
      toast.success("Event deleted successfully");
      router.push("/my-events");
    },
    onError: () => {
      toast.error("Failed to delete event");
    },
  });

  // Cancel registration mutation
  const cancelRegistrationMutation = useCancelRegistration();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push(`/auth?redirect=/events/${event.id}`);
      return;
    }

    registerMutation.mutate({
      eventId: event.id,
      userId: user.id,
      name: user.username,
      email: user.email,
      phone: user?.phone || "",
      additionalAttendees: attendees,
      ticketTierId: selectedTicketTierId,
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(event.id);
  };

  const handleCancelRegistration = () => {
    if (!user) {
      router.push(`/auth?redirect=/events/${event.id}`);
      return;
    }

    cancelRegistrationMutation.mutate(
      { eventId: event.id, userId: user.id },
      {
        onSuccess: () => {
          setIsRegistered(false);
        },
      }
    );
  };

  return (
    <main>
      {/* Hero Section */}
      <div
        className="h-64 bg-cover bg-center md:h-80"
        style={{ backgroundImage: `url(${event.imageUrl})` }}
      >
        <div className="container mx-auto flex h-full items-end px-4 pb-8">
          <div className="bg-background/80 p-4 backdrop-blur-sm md:max-w-2xl">
            <h1 className="text-2xl font-bold md:text-4xl">{event.title}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
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
            {registrationSuccess || isRegistered ? (
              <div className="mb-6 space-y-4">
                <div className="rounded-md bg-green-50 p-4 text-green-800">
                  <p className="font-medium">You're registered!</p>
                  <p className="mt-1 text-sm">
                    {registrationSuccess
                      ? "You'll receive a confirmation email shortly."
                      : "You're confirmed for this event."}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-red-300 text-red-700 hover:bg-red-50"
                  onClick={handleCancelRegistration}
                  disabled={cancelRegistrationMutation.isPending}
                >
                  {cancelRegistrationMutation.isPending
                    ? "Cancelling..."
                    : "Cancel My Registration"}
                </Button>
              </div>
            ) : isRegistering ? (
              <form onSubmit={handleRegister} className="mb-6 space-y-4">
                <h3 className="text-lg font-medium">Register for this event</h3>

                {/* Ticket tiers selection for paid events */}
                {!event.isFree &&
                  event.ticketTiers &&
                  event.ticketTiers.length > 0 && (
                    <div className="space-y-3">
                      <Label htmlFor="ticketTier">Select Ticket Tier</Label>
                      <div className="space-y-3">
                        {event.ticketTiers.map((tier) => (
                          <div
                            key={tier.id}
                            className={`cursor-pointer rounded-md border p-3 transition-colors ${
                              selectedTicketTierId === tier.id
                                ? "border-primary bg-primary/5"
                                : "hover:border-gray-400"
                            }`}
                            onClick={() => setSelectedTicketTierId(tier.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="ticketTier"
                                  id={`tier-${tier.id}`}
                                  checked={selectedTicketTierId === tier.id}
                                  onChange={() =>
                                    setSelectedTicketTierId(tier.id)
                                  }
                                  className="h-4 w-4 text-primary"
                                />
                                <Label
                                  htmlFor={`tier-${tier.id}`}
                                  className="text-base font-medium cursor-pointer"
                                >
                                  {tier.name}
                                </Label>
                              </div>
                              <span className="font-medium text-amber-700">
                                ${tier.price.toFixed(2)}
                              </span>
                            </div>
                            {tier.description && (
                              <p className="ml-6 mt-1 text-sm text-muted-foreground">
                                {tier.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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

                {!event.isFree &&
                  event.ticketTiers &&
                  event.ticketTiers.length > 0 &&
                  !selectedTicketTierId && (
                    <p className="text-sm text-amber-600">
                      Please select a ticket tier to continue
                    </p>
                  )}

                <Button
                  type="submit"
                  disabled={
                    registerMutation.isPending ||
                    (!event.isFree &&
                      event.ticketTiers &&
                      event.ticketTiers.length > 0 &&
                      !selectedTicketTierId)
                  }
                  className="w-full"
                >
                  {registerMutation.isPending
                    ? "Registering..."
                    : event.isFree
                      ? "Complete Registration"
                      : selectedTicketTierId && event.ticketTiers
                        ? `Complete Registration ($${(event.ticketTiers.find((t) => t.id === selectedTicketTierId)?.price || 0).toFixed(2)})`
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
                <h3 className="font-medium">Price</h3>
                {event.isFree ? (
                  <p className="text-green-600 font-medium">Free</p>
                ) : event.ticketTiers && event.ticketTiers.length > 0 ? (
                  <div className="space-y-2 border rounded-md p-3 bg-amber-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-amber-800">
                        {event.ticketTiers.length > 1
                          ? `${event.ticketTiers.length} ticket tiers available`
                          : "Ticket pricing"}
                      </span>
                      {isAuthenticated && !isRegistered && !isRegistering && (
                        <Button
                          onClick={() => setIsRegistering(true)}
                          variant="link"
                          className="h-auto p-0 text-sm text-primary"
                        >
                          View Tickets
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2 divide-y divide-amber-100">
                      {event.ticketTiers.map((tier) => (
                        <div
                          key={tier.id}
                          className="flex flex-col pt-2 first:pt-0"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{tier.name}</span>
                            <span className="text-amber-700 font-semibold">
                              ${tier.price.toFixed(2)}
                            </span>
                          </div>
                          {tier.description && (
                            <p className="text-xs text-gray-600 mt-1">
                              {tier.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p>Not available</p>
                )}
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
