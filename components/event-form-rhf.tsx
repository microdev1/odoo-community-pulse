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
import { Event, EventCategory } from "@/lib/events-db";
import { EventService } from "@/lib/event-service";

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
      }
    : {
        imageUrl:
          "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80",
      };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues,
  });

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
      };

      if (isEditing && event) {
        // Update existing event
        await EventService.updateEvent(event.id, eventData);
        toast.success("Event updated successfully");
        router.push(`/events/${event.id}`);
      } else {
        // Create new event
        // const newEvent = await EventService.createEvent(eventData);
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
