"use client";

import { Header } from "@/components/header";
import { EventForm } from "@/components/event-form";
import { notFound } from "next/navigation";

interface EditEventPageProps {
  params: {
    id: string;
  };
}
import { trpc } from "@/lib/trpc";
import React from "react";

function EditEventClient({ id }: { id: string }) {
  const { data: event, isLoading } = trpc.event.getById.useQuery({ id });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return notFound();
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Edit Event</h1>
        <EventForm event={event} isEditing={true} />
      </main>
    </div>
  );
}

// Server component wrapper
export default function EditEventPage({ params }: EditEventPageProps) {
  return <EditEventClient id={params.id} />;
}
