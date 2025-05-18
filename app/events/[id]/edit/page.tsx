import { Header } from "@/components/header";
import { EventForm } from "@/components/event-form";
import { getEventById } from "@/lib/server-events";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

interface EditEventPageProps {
  params: {
    id: string;
  };
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  // Await params before destructuring to comply with Next.js 15
  const { id } = await params;
  // Force revalidation to ensure fresh data
  revalidatePath(`/events/${id}/edit`);
  const event = await getEventById(id);

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
