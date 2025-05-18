import { Header } from "@/components/header";
import { EventForm } from "@/components/event-form";

export default function CreateEventPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Create New Event</h1>
        <EventForm />
      </main>
    </div>
  );
}
