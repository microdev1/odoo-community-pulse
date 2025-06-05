"use client";

import { useState, useEffect } from "react";
import { EventCard } from "@/components/event-card";

interface SearchResultsProps {
  query: string;
}

export function SearchResults({ query }: SearchResultsProps) {
  const [results, setResults] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function searchEvents() {
      if (!query) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // In a real app, this would be a dedicated search API
        // For the MVP, we'll just filter client-side
        const events = await getApprovedEvents();

        const searchTerms = query.toLowerCase().split(" ");

        // Simple search algorithm that checks if any search term is in the title,
        // description, or location
        const filteredEvents = events.filter((event) => {
          const title = event.title.toLowerCase();
          const description = event.description.toLowerCase();
          const shortDesc = (event.shortDescription || "").toLowerCase();
          const location = event.location.address.toLowerCase();
          const category = event.category.toLowerCase();

          return searchTerms.some(
            (term) =>
              title.includes(term) ||
              description.includes(term) ||
              shortDesc.includes(term) ||
              location.includes(term) ||
              category.includes(term)
          );
        });

        setResults(filteredEvents);
      } catch (error) {
        console.error("Error searching events:", error);
      } finally {
        setIsLoading(false);
      }
    }

    searchEvents();
  }, [query]);

  if (isLoading) {
    return <p>Searching...</p>;
  }

  if (results.length === 0) {
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
      {results.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
