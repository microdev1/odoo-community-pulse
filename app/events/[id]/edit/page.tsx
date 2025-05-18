import { Header } from "@/components/header";
import { EventForm } from "@/components/event-form";
import { getEventById } from "@/lib/events-db";
import { notFound } from "next/navigation";

interface EditEventPageProps {
  params: {
    id: string;
  };
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const event = await getEventById(params.id);

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Edit Event</h1>
        <EventForm event={event} isEditing={true} />
      </main>
    </div>
  );
}
