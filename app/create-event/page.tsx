import { Header } from "@/components/header";
import { EventFormRHF } from "@/components/event-form-rhf";

export default function CreateEventPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Create New Event</h1>
        <EventFormRHF />
      </main>
    </div>
  );
}
