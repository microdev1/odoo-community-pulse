"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Event,
  EventCategory,
  createEvent,
  updateEvent,
} from "@/lib/events-db";

interface EventFormProps {
  event?: Event;
  isEditing?: boolean;
}

export function EventForm({ event, isEditing = false }: EventFormProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    shortDescription: event?.shortDescription || "",
    imageUrl:
      event?.imageUrl ||
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80",
    date: event?.date ? new Date(event.date).toISOString().split("T")[0] : "",
    time: event?.date
      ? new Date(event.date).toISOString().split("T")[1].substring(0, 5)
      : "",
    endDate: event?.endDate
      ? new Date(event.endDate).toISOString().split("T")[0]
      : "",
    endTime: event?.endDate
      ? new Date(event.endDate).toISOString().split("T")[1].substring(0, 5)
      : "",
    location: event?.location.address || "",
    category: event?.category || "Other",
    registrationDeadline: event?.registrationDeadline
      ? new Date(event.registrationDeadline).toISOString().split("T")[0]
      : "",
    registrationDeadlineTime: event?.registrationDeadline
      ? new Date(event.registrationDeadline)
          .toISOString()
          .split("T")[1]
          .substring(0, 5)
      : "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories: EventCategory[] = [
    "Garage Sale",
    "Sports",
    "Matches",
    "Community Class",
    "Volunteer Opportunity",
    "Exhibition",
    "Festival",
    "Other",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/auth");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const eventDate = new Date(`${formData.date}T${formData.time}`);

      const eventData: any = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription || undefined,
        imageUrl: formData.imageUrl,
        date: eventDate,
        location: {
          address: formData.location,
        },
        category: formData.category as EventCategory,
        organizer: {
          id: user.id,
          name: user.username,
          email: user.email,
          phone: user.phone,
        },
      };

      if (formData.endDate && formData.endTime) {
        eventData.endDate = new Date(`${formData.endDate}T${formData.endTime}`);
      }

      if (formData.registrationDeadline && formData.registrationDeadlineTime) {
        eventData.registrationDeadline = new Date(
          `${formData.registrationDeadline}T${formData.registrationDeadlineTime}`
        );
      }

      let result;

      if (isEditing && event) {
        result = await updateEvent(event.id, eventData);
      } else {
        result = await createEvent(eventData);
      }

      if (result) {
        router.push(`/events/${result.id}`);
      } else {
        setError("Failed to save event. Please try again.");
      }
    } catch (err) {
      setError(
        "An error occurred. Please check your form input and try again."
      );
      console.error("Event submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Event Title *</Label>
          <Input
            id="title"
            required
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Community Cleanup Drive"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="shortDescription">Short Description</Label>
          <Input
            id="shortDescription"
            value={formData.shortDescription}
            onChange={handleInputChange}
            placeholder="A brief one-line description"
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground">
            A brief description for event cards
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Full Description *</Label>
          <Textarea
            id="description"
            required
            rows={5}
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Detailed information about your event..."
            disabled={isSubmitting}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="imageUrl">Image URL *</Label>
          <Input
            id="imageUrl"
            type="url"
            required
            value={formData.imageUrl}
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground">
            Link to an image for your event (use a service like Unsplash for
            free images)
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="date">Event Date *</Label>
            <Input
              id="date"
              type="date"
              required
              value={formData.date}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="time">Start Time *</Label>
            <Input
              id="time"
              type="time"
              required
              value={formData.time}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            required
            value={formData.location}
            onChange={handleInputChange}
            placeholder="123 Main St, City, State"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="category">Category *</Label>
          <select
            id="category"
            required
            value={formData.category}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="registrationDeadline">
              Registration Deadline Date
            </Label>
            <Input
              id="registrationDeadline"
              type="date"
              value={formData.registrationDeadline}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="registrationDeadlineTime">
              Registration Deadline Time
            </Label>
            <Input
              id="registrationDeadlineTime"
              type="time"
              value={formData.registrationDeadlineTime}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : isEditing
              ? "Update Event"
              : "Create Event"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
