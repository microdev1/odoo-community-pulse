"use client";

import { useState } from "react";
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
import { Event, EventCategory, TicketTier } from "@/lib/events-db";
import { EventService } from "@/lib/event-service";

// Schema for ticket tiers
const ticketTierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Tier name is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  maxAttendees: z.number().int().optional(),
});

// Schema for event form validation
const eventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  shortDescription: z
    .string()
    .min(10, "Short description must be at least 10 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  imageUrl: z.string().url("Please provide a valid image URL"),
  date: z
    .string()
    .refine((val) => !isNaN(new Date(val).getTime()), "Invalid date"),
  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().min(5, "Location must be at least 5 characters"),
  category: z.string(),
  registrationDeadline: z.string().optional(),
  registrationDeadlineTime: z.string().optional(),
  isFree: z.boolean(),
  price: z.number().min(0, "Price must be a positive number").optional(),
  ticketTiers: z.array(ticketTierSchema).optional(),
});

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
        price: event.price,
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

  // Add a new ticket tier
  const addTicketTier = () => {
    const newTier: TicketTier = {
      id: `tier-${Math.random().toString(36).substring(2, 9)}`,
      name: "",
      price: 0,
      description: "",
    };

    const updatedTiers = [...ticketTiers, newTier];
    setTicketTiers(updatedTiers);
    setValue("ticketTiers", updatedTiers);
  };

  // Remove a ticket tier
  const removeTicketTier = (id: string) => {
    const updatedTiers = ticketTiers.filter((tier) => tier.id !== id);
    setTicketTiers(updatedTiers);
    setValue("ticketTiers", updatedTiers);
  };

  // Update a ticket tier
  const updateTicketTier = (
    id: string,
    field: keyof TicketTier,
    value: any
  ) => {
    const updatedTiers = ticketTiers.map((tier) =>
      tier.id === id
        ? { ...tier, [field]: field === "price" ? parseFloat(value) : value }
        : tier
    );
    setTicketTiers(updatedTiers);
    setValue("ticketTiers", updatedTiers);
  };

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
        category: data.category as EventCategory,
        organizer: {
          id: user.id,
          name: user.username,
          email: user.email,
          phone: user.phone,
        },
        registrationDeadline,
        isFree: data.isFree,
        price: data.isFree ? undefined : data.price,
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
        await EventService.updateEvent(event.id, eventData);
        toast.success("Event updated successfully");
        router.push(`/events/${event.id}`);
      } else {
        // Create new event
        void (await EventService.createEvent(eventData));
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

          {!isFreeEvent && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="price">Default Event Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="19.99"
                  {...register("price", { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.price.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  This is the default price shown when no ticket tiers are
                  selected
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Ticket Tiers</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTicketTier}
                    size="sm"
                  >
                    Add Tier
                  </Button>
                </div>

                {ticketTiers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No ticket tiers added. The default price will be used.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {ticketTiers.map((tier, index) => (
                      <div key={tier.id} className="rounded-md border p-4">
                        <div className="flex justify-between">
                          <h4 className="font-medium">
                            Ticket Tier #{index + 1}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => removeTicketTier(tier.id)}
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="mt-2 grid gap-4 md:grid-cols-2">
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
                            />
                          </div>
                          <div>
                            <Label htmlFor={`tier-price-${tier.id}`}>
                              Price ($)
                            </Label>
                            <Input
                              id={`tier-price-${tier.id}`}
                              type="number"
                              step="0.01"
                              min="0"
                              value={tier.price}
                              onChange={(e) =>
                                updateTicketTier(
                                  tier.id,
                                  "price",
                                  e.target.value
                                )
                              }
                              placeholder="29.99"
                            />
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
                            />
                          </div>
                          <div>
                            <Label htmlFor={`tier-max-${tier.id}`}>
                              Max Attendees (Optional)
                            </Label>
                            <Input
                              id={`tier-max-${tier.id}`}
                              type="number"
                              min="1"
                              value={tier.maxAttendees || ""}
                              onChange={(e) =>
                                updateTicketTier(
                                  tier.id,
                                  "maxAttendees",
                                  e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined
                                )
                              }
                              placeholder="Leave blank for unlimited"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
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
