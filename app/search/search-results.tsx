"use client";

import { EventCard } from "@/components/event-card";
import { useSearchEvents } from "@/lib/event-hooks";

interface SearchResultsProps {
  query: string;
}

export function SearchResults({ query }: SearchResultsProps) {
  const res = useSearchEvents({ query });

  if (res.isLoading) {
    return <p>Searching...</p>;
  }

  if (res.data?.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <h2 className="mb-2 text-xl font-medium">No results found</h2>
        <p>
          We couldn't find any events matching your search. Try different
          keywords or browse all events.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {res.data?.map((event) => <EventCard key={event.id} event={event} />)}
    </div>
  );
}
