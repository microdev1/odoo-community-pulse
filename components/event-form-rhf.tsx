"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Schema for ticket tiers
const ticketTierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Tier name is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  description: z.string().min(1, "Description is required"),
});

// Schema for event form validation
const eventSchema = z
  .object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    shortDescription: z
      .string()
      .min(10, "Short description must be at least 10 characters"),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters"),
    imageUrl: z.string().url("Please provide a valid image URL"),
    date: z
      .string()
      .refine((val) => !isNaN(new Date(val).getTime()), "Invalid date"),
    time: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format (HH:MM)"
      ),
    endDate: z.string().optional(),
    endTime: z.string().optional(),
    location: z.string().min(5, "Location must be at least 5 characters"),
    category: z.string(),
    registrationDeadline: z.string().optional(),
    registrationDeadlineTime: z.string().optional(),
    isFree: z.boolean(),
    ticketTiers: z.array(ticketTierSchema).optional(),
  })
  .refine(
    (data) => {
      // If it's not a free event, ensure there's at least one ticket tier
      if (
        !data.isFree &&
        (!data.ticketTiers || data.ticketTiers.length === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Paid events must have at least one ticket tier",
      path: ["ticketTiers"],
    }
  );

type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormProps {
  event?: Event;
  isEditing?: boolean;
}

export function EventFormRHF({ event, isEditing = false }: EventFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>(
    event?.ticketTiers || []
  );

  // Pre-populate form with existing event data if editing
  const defaultValues: Partial<EventFormValues> = event
    ? {
        title: event.title,
        shortDescription: event.shortDescription || "",
        description: event.description,
        imageUrl: event.imageUrl,
        date: format(new Date(event.date), "yyyy-MM-dd"),
        time: format(new Date(event.date), "HH:mm"),
        endDate: event.endDate
          ? format(new Date(event.endDate), "yyyy-MM-dd")
          : undefined,
        endTime: event.endDate
          ? format(new Date(event.endDate), "HH:mm")
          : undefined,
        location: event.location.address,
        category: event.category,
        registrationDeadline: event.registrationDeadline
          ? format(new Date(event.registrationDeadline), "yyyy-MM-dd")
          : undefined,
        registrationDeadlineTime: event.registrationDeadline
          ? format(new Date(event.registrationDeadline), "HH:mm")
          : undefined,
        isFree: event.isFree,
        ticketTiers: event.ticketTiers || [],
      }
    : {
        imageUrl:
          "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80",
        isFree: true,
        ticketTiers: [],
      };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues,
  });

  const isFreeEvent = watch("isFree");

  // Add a new ticket tier with useCallback to memoize the function
  const addTicketTier = useCallback(() => {
    const newTier: TicketTier = {
      id: `tier-${Math.random().toString(36).substring(2, 9)}`,
      name: "Standard Ticket",
      price: 10.0,
      description: "General admission ticket",
    };

    const updatedTiers = [...ticketTiers, newTier];
    setTicketTiers(updatedTiers);
    setValue("ticketTiers", updatedTiers);
  }, [ticketTiers, setValue]);

  // Watch for changes to isFree field
  useEffect(() => {
    // If switching from free to paid and no ticket tiers exist, add one
    if (!isFreeEvent && ticketTiers.length === 0) {
      addTicketTier();
    }
  }, [isFreeEvent, ticketTiers.length, addTicketTier]);

  // Add click event listener to hide preset menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const presetMenu = document.getElementById("preset-menu");
      if (presetMenu && !presetMenu.contains(event.target as Node)) {
        presetMenu.classList.add("hidden");
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Remove a ticket tier
  const removeTicketTier = useCallback(
    (id: string) => {
      const updatedTiers = ticketTiers.filter((tier) => tier.id !== id);
      setTicketTiers(updatedTiers);
      setValue("ticketTiers", updatedTiers);
    },
    [ticketTiers, setValue]
  );

  // Update a ticket tier
  const updateTicketTier = useCallback(
    (id: string, field: keyof TicketTier, value: any) => {
      const updatedTiers = ticketTiers.map((tier) => {
        if (tier.id === id) {
          let processedValue = value;

          // Handle price specifically
          if (field === "price") {
            const numValue = parseFloat(value);
            processedValue = isNaN(numValue) ? 0 : numValue;
          }

          return { ...tier, [field]: processedValue };
        }
        return tier;
      });

      setTicketTiers(updatedTiers);
      setValue("ticketTiers", updatedTiers);
    },
    [ticketTiers, setValue]
  );

  const onSubmit = async (data: EventFormValues) => {
    if (!user) {
      toast.error("You must be logged in to create or edit events");
      return;
    }

    setIsSubmitting(true);

    try {
      // Construct dates from form values
      const eventDate = new Date(`${data.date}T${data.time}`);

      let eventEndDate = undefined;
      if (data.endDate && data.endTime) {
        eventEndDate = new Date(`${data.endDate}T${data.endTime}`);
      }

      let registrationDeadline = undefined;
      if (data.registrationDeadline && data.registrationDeadlineTime) {
        registrationDeadline = new Date(
          `${data.registrationDeadline}T${data.registrationDeadlineTime}`
        );
      }

      const eventData = {
        title: data.title,
        shortDescription: data.shortDescription,
        description: data.description,
        imageUrl: data.imageUrl,
        date: eventDate,
        endDate: eventEndDate,
        location: {
          address: data.location,
          // Would normally geocode here
          latitude: event?.location.latitude,
          longitude: event?.location.longitude,
        },
        category: data.category,
        organizer: {
          id: user.id,
          name: user.username,
          email: user.email,
          phone: user.phone,
        },
        registrationDeadline,
        isFree: data.isFree,
        // Add ticket tiers only if it's not a free event
        ticketTiers: data.isFree
          ? undefined
          : data.ticketTiers?.map((tier) => ({
              ...tier,
              // Generate ID for new ticket tiers if not provided
              id:
                tier.id || `tier-${Math.random().toString(36).substring(2, 9)}`,
            })),
      };

      if (isEditing && event) {
        // Update existing event
        await updateEvent(event.id, eventData);
        toast.success("Event updated successfully");
        router.push(`/events/${event.id}`);
      } else {
        // Create new event
        void (await createEvent(eventData));
        toast.success("Event created! Awaiting admin approval.");
        router.push(`/my-events`);
      }
    } catch (error) {
      console.error("Error submitting event:", error);
      toast.error("Failed to save event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Event Title</Label>
          <Input
            id="title"
            placeholder="Summer Community Festival"
            {...register("title")}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="shortDescription">Short Description</Label>
          <Input
            id="shortDescription"
            placeholder="A brief description of your event (shown in cards)"
            {...register("shortDescription")}
          />
          {errors.shortDescription && (
            <p className="mt-1 text-sm text-red-600">
              {errors.shortDescription.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Full Description</Label>
          <Textarea
            id="description"
            placeholder="Detailed information about your event"
            className="min-h-32"
            {...register("description")}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            placeholder="https://example.com/image.jpg"
            {...register("imageUrl")}
          />
          {errors.imageUrl && (
            <p className="mt-1 text-sm text-red-600">
              {errors.imageUrl.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="date">Event Date</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="time">Event Time</Label>
            <Input id="time" type="time" {...register("time")} />
            {errors.time && (
              <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="endDate">End Date (Optional)</Label>
            <Input id="endDate" type="date" {...register("endDate")} />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.endDate.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="endTime">End Time (Optional)</Label>
            <Input id="endTime" type="time" {...register("endTime")} />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">
                {errors.endTime.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="123 Main St, City"
            {...register("location")}
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">
              {errors.location.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="category">Event Category</Label>
          <select
            id="category"
            {...register("category")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="Garage Sale">Garage Sale</option>
            <option value="Sports">Sports</option>
            <option value="Matches">Matches</option>
            <option value="Community Class">Community Class</option>
            <option value="Volunteer Opportunity">Volunteer Opportunity</option>
            <option value="Exhibition">Exhibition</option>
            <option value="Festival">Festival</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">
              {errors.category.message}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFree"
              {...register("isFree")}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="isFree">This is a free event</Label>
          </div>

          {!isFreeEvent ? (
            <div className="rounded-md bg-amber-50 p-3 mt-2 text-amber-800 text-sm border border-amber-100">
              <div className="flex gap-2 items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
                <div>
                  <p className="font-medium">Paid event settings</p>
                  <p className="text-amber-700 text-xs mt-1">
                    Create at least one ticket tier for your paid event. You'll
                    be able to add more tiers if needed.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-md bg-blue-50 p-3 mt-2 text-blue-800 text-sm border border-blue-100">
              <div className="flex gap-2 items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
                <div>
                  <p className="font-medium">Free event</p>
                  <p className="text-blue-700 text-xs mt-1">
                    Your event is set as free. No ticket tiers are needed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isFreeEvent && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Ticket Tiers</h3>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          // Show preset options
                          const presetMenu =
                            document.getElementById("preset-menu");
                          if (presetMenu) {
                            presetMenu.classList.toggle("hidden");
                          }
                        }}
                        size="sm"
                        className="text-blue-600"
                      >
                        Presets
                      </Button>
                      <div
                        id="preset-menu"
                        className="hidden absolute right-0 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                      >
                        <div
                          className="py-1"
                          role="menu"
                          aria-orientation="vertical"
                        >
                          <button
                            type="button"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            onClick={() => {
                              // Basic: Early Bird, Standard
                              setTicketTiers([
                                {
                                  id: `tier-${Math.random().toString(36).substring(2, 9)}`,
                                  name: "Early Bird",
                                  price: 15.0,
                                  description:
                                    "Limited availability early bird tickets at a discounted price",
                                },
                                {
                                  id: `tier-${Math.random().toString(36).substring(2, 9)}`,
                                  name: "Standard",
                                  price: 25.0,
                                  description: "Regular admission ticket",
                                },
                              ]);
                              setValue("ticketTiers", [
                                {
                                  id: `tier-${Math.random().toString(36).substring(2, 9)}`,
                                  name: "Early Bird",
                                  price: 15.0,
                                  description:
                                    "Limited availability early bird tickets at a discounted price",
                                },
                                {
                                  id: `tier-${Math.random().toString(36).substring(2, 9)}`,
                                  name: "Standard",
                                  price: 25.0,
                                  description: "Regular admission ticket",
                                },
                              ]);
                              document
                                .getElementById("preset-menu")
                                ?.classList.add("hidden");
                            }}
                          >
                            Basic (Early Bird + Standard)
                          </button>
                          <button
                            type="button"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            onClick={() => {
                              // Premium: Standard, VIP, Premium
                              setTicketTiers([
                                {
                                  id: `tier-${Math.random().toString(36).substring(2, 9)}`,
                                  name: "Standard",
                                  price: 25.0,
                                  description: "Regular admission ticket",
                                },
                                {
                                  id: `tier-${Math.random().toString(36).substring(2, 9)}`,
                                  name: "VIP",
                                  price: 50.0,
                                  description:
                                    "VIP access with premium seating and exclusive perks",
                                },
                                {
                                  id: `tier-${Math.random().toString(36).substring(2, 9)}`,
                                  name: "Premium",
                                  price: 100.0,
                                  description:
                                    "All-inclusive premium experience with special benefits",
                                },
                              ]);
                              setValue("ticketTiers", [
                                {
                                  id: `tier-${Math.random().toString(36).substring(2, 9)}`,
                                  name: "Standard",
                                  price: 25.0,
                                  description: "Regular admission ticket",
                                },
                                {
                                  id: `tier-${Math.random().toString(36).substring(2, 9)}`,
                                  name: "VIP",
                                  price: 50.0,
                                  description:
                                    "VIP access with premium seating and exclusive perks",
                                },
                                {
                                  id: `tier-${Math.random().toString(36).substring(2, 9)}`,
                                  name: "Premium",
                                  price: 100.0,
                                  description:
                                    "All-inclusive premium experience with special benefits",
                                },
                              ]);
                              document
                                .getElementById("preset-menu")
                                ?.classList.add("hidden");
                            }}
                          >
                            Premium (Standard + VIP + Premium)
                          </button>
                          <button
                            type="button"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            onClick={() => {
                              // Family: Individual, Family (4), Group (10)
                              setTicketTiers([
                                {
                                  id: `tier-${Math.random().toString(36).substring(2, 9)}`,
                                  name: "Individual",
                                  price: 20.0,
                                  description: "Single person admission",
                                },
                                {
                                  id: `tier-${Math.random().toString(36).substring(2, 9)}`,
                                  name: "Family Pack",
                                  price: 60.0,
                                  description:
                                    "Admission for up to 4 family members",
                                },
                                {
                                  id: `tier-${Math.random().toString(36).substring(2, 9)}`,
                                  name: "Group Discount",
                                  price: 150.0,
                                  description:
                                    "Admission for groups of up to 10 people",
                                },
                              ]);
                              setValue("ticketTiers", [
                                {
                                  id: `tier-${Math.random().toString(36).substring(2, 9)}`,
                                  name: "Individual",
                                  price: 20.0,
                                  description: "Single person admission",
                                },
                                {
                                  id: `tier-${Math.random().toString(36).substring(2, 9)}`,
                                  name: "Family Pack",
                                  price: 60.0,
                                  description:
                                    "Admission for up to 4 family members",
                                },
                                {
                                  id: `tier-${Math.random().toString(36).substring(2, 9)}`,
                                  name: "Group Discount",
                                  price: 150.0,
                                  description:
                                    "Admission for groups of up to 10 people",
                                },
                              ]);
                              document
                                .getElementById("preset-menu")
                                ?.classList.add("hidden");
                            }}
                          >
                            Family & Group Packs
                          </button>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            type="button"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            onClick={() => {
                              // Clear and add one empty tier
                              const newTier = {
                                id: `tier-${Math.random().toString(36).substring(2, 9)}`,
                                name: "Standard Ticket",
                                price: 10.0,
                                description: "General admission ticket",
                              };
                              setTicketTiers([newTier]);
                              setValue("ticketTiers", [newTier]);
                              document
                                .getElementById("preset-menu")
                                ?.classList.add("hidden");
                            }}
                          >
                            Clear & Start Over
                          </button>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addTicketTier}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                      Add Tier
                    </Button>
                  </div>
                </div>

                {ticketTiers.length === 0 ? (
                  <div className="rounded-md border border-dashed p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      No ticket tiers added yet. Add tiers to offer different
                      pricing options.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addTicketTier}
                      className="mt-3"
                      size="sm"
                    >
                      Add Your First Tier
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ticketTiers.map((tier, index) => (
                      <div
                        key={tier.id}
                        className={`rounded-md border p-4 ${
                          !tier.name ||
                          !tier.description ||
                          !tier.price ||
                          tier.price <= 0
                            ? "bg-red-50/30 border-red-100"
                            : "bg-muted/20"
                        }`}
                      >
                        <div className="flex justify-between">
                          <h4 className="font-medium flex items-center gap-2">
                            <span
                              className={`flex items-center justify-center rounded-full w-6 h-6 text-xs font-bold ${
                                !tier.name ||
                                !tier.description ||
                                !tier.price ||
                                tier.price <= 0
                                  ? "bg-red-100 text-red-700"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {index + 1}
                            </span>
                            {tier.name || `Ticket Tier #${index + 1}`}
                          </h4>
                          <div className="flex gap-2">
                            {index > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                  // Move tier up
                                  const newTiers = [...ticketTiers];
                                  const temp = newTiers[index];
                                  newTiers[index] = newTiers[index - 1];
                                  newTiers[index - 1] = temp;
                                  setTicketTiers(newTiers);
                                  setValue("ticketTiers", newTiers);
                                }}
                                size="sm"
                                className="text-gray-500 hover:text-gray-700 h-7 px-2"
                                title="Move up"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="m18 15-6-6-6 6" />
                                </svg>
                              </Button>
                            )}
                            {index < ticketTiers.length - 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                  // Move tier down
                                  const newTiers = [...ticketTiers];
                                  const temp = newTiers[index];
                                  newTiers[index] = newTiers[index + 1];
                                  newTiers[index + 1] = temp;
                                  setTicketTiers(newTiers);
                                  setValue("ticketTiers", newTiers);
                                }}
                                size="sm"
                                className="text-gray-500 hover:text-gray-700 h-7 px-2"
                                title="Move down"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="m6 9 6 6 6-6" />
                                </svg>
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                // Duplicate tier
                                const newTier = {
                                  ...tier,
                                  id: `tier-${Math.random().toString(36).substring(2, 9)}`,
                                  name: `${tier.name} (Copy)`,
                                };
                                const newTiers = [...ticketTiers];
                                newTiers.splice(index + 1, 0, newTier);
                                setTicketTiers(newTiers);
                                setValue("ticketTiers", newTiers);
                              }}
                              size="sm"
                              className="text-blue-500 hover:text-blue-700 h-7 px-2"
                              title="Duplicate tier"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect
                                  x="8"
                                  y="8"
                                  width="12"
                                  height="12"
                                  rx="2"
                                  ry="2"
                                />
                                <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                              </svg>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => removeTicketTier(tier.id)}
                              size="sm"
                              className="text-red-500 hover:text-red-700 h-7 px-2"
                              disabled={ticketTiers.length === 1}
                              title={
                                ticketTiers.length === 1
                                  ? "Paid events require at least one ticket tier"
                                  : "Remove this tier"
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor={`tier-name-${tier.id}`}>Name</Label>
                            <Input
                              id={`tier-name-${tier.id}`}
                              value={tier.name}
                              onChange={(e) =>
                                updateTicketTier(
                                  tier.id,
                                  "name",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., VIP, Standard, Early Bird"
                              className={!tier.name ? "border-red-300" : ""}
                            />
                            {!tier.name && (
                              <p className="mt-1 text-sm text-red-600">
                                Tier name is required
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor={`tier-price-${tier.id}`}>
                              Price ($)
                            </Label>
                            <Input
                              id={`tier-price-${tier.id}`}
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={tier.price}
                              onChange={(e) =>
                                updateTicketTier(
                                  tier.id,
                                  "price",
                                  e.target.value
                                )
                              }
                              placeholder="29.99"
                              className={`font-medium ${
                                !tier.price || tier.price <= 0
                                  ? "border-red-300"
                                  : ""
                              }`}
                            />
                            {(!tier.price || tier.price <= 0) && (
                              <p className="mt-1 text-sm text-red-600">
                                Price must be greater than 0
                              </p>
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor={`tier-desc-${tier.id}`}>
                              Description
                            </Label>
                            <Textarea
                              id={`tier-desc-${tier.id}`}
                              value={tier.description}
                              onChange={(e) =>
                                updateTicketTier(
                                  tier.id,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="What's included in this ticket tier"
                              rows={2}
                              className={
                                !tier.description ? "border-red-300" : ""
                              }
                            />
                            {!tier.description && (
                              <p className="mt-1 text-sm text-red-600">
                                Description is required
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {errors.ticketTiers && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.ticketTiers.message}
                  </p>
                )}

                {/* Summary of ticket tiers */}
                {ticketTiers.length > 0 && (
                  <div className="mt-4 rounded-md bg-slate-50 border p-3">
                    <h4 className="text-sm font-medium mb-2">
                      Ticket Tier Summary
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="grid grid-cols-3 gap-2 text-slate-600 text-xs font-medium border-b pb-1 mb-1">
                        <div>Tier</div>
                        <div>Price</div>
                        <div className="text-right">Actions</div>
                      </div>
                      {ticketTiers.map((tier, index) => (
                        <div
                          key={`summary-${tier.id}`}
                          className="grid grid-cols-3 gap-2 items-center"
                        >
                          <div className="truncate">
                            {tier.name || `Unnamed Tier #${index + 1}`}
                          </div>
                          <div
                            className={
                              !tier.price || tier.price <= 0
                                ? "text-red-600"
                                : ""
                            }
                          >
                            ${tier.price ? tier.price.toFixed(2) : "0.00"}
                          </div>
                          <div className="flex justify-end space-x-1">
                            <button
                              type="button"
                              onClick={() => {
                                // Scroll to the tier
                                document
                                  .getElementById(`tier-name-${tier.id}`)
                                  ?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                  });
                                // Focus on the name field
                                setTimeout(
                                  () =>
                                    document
                                      .getElementById(`tier-name-${tier.id}`)
                                      ?.focus(),
                                  500
                                );
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            {ticketTiers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTicketTier(tier.id)}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="border-t pt-1 mt-1 flex justify-between items-center">
                        <span className="text-xs text-slate-500">
                          {ticketTiers.length}{" "}
                          {ticketTiers.length === 1 ? "tier" : "tiers"} defined
                        </span>
                        <button
                          type="button"
                          onClick={addTicketTier}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          + Add Another Tier
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="registrationDeadline">
              Registration Deadline Date (Optional)
            </Label>
            <Input
              id="registrationDeadline"
              type="date"
              {...register("registrationDeadline")}
            />
            {errors.registrationDeadline && (
              <p className="mt-1 text-sm text-red-600">
                {errors.registrationDeadline.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="registrationDeadlineTime">
              Registration Deadline Time (Optional)
            </Label>
            <Input
              id="registrationDeadlineTime"
              type="time"
              {...register("registrationDeadlineTime")}
            />
            {errors.registrationDeadlineTime && (
              <p className="mt-1 text-sm text-red-600">
                {errors.registrationDeadlineTime.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting
          ? "Saving..."
          : isEditing
            ? "Update Event"
            : "Create Event"}
      </Button>
    </form>
  );
}
