import mockEventData from "./mock-event-data.json";
import { Event, EventRegistration } from "./events-db";

/**
 * Helper function to parse date strings into Date objects
 * @param jsonData Input data with date strings
 * @returns Converted object with proper Date objects
 */
function parseDatesFromJson<T>(jsonData: Record<string, unknown>): T {
  const result = { ...jsonData };

  // Convert date strings to Date objects for top-level properties
  for (const key in result) {
    if (
      typeof result[key] === "string" &&
      (key.includes("date") ||
        key.includes("Date") ||
        key === "createdAt" ||
        key === "updatedAt")
    ) {
      result[key] = new Date(result[key]);
    }

    // Handle nested objects
    else if (typeof result[key] === "object" && result[key] !== null) {
      result[key] = parseDatesFromJson(result[key] as Record<string, unknown>);
    }
  }

  return result as T;
}

/**
 * Load and parse event data from the common JSON source
 */
export function loadEventData(): {
  events: Event[];
  eventRegistrations: EventRegistration[];
} {
  // Parse the mock data to convert string dates to Date objects
  const events = mockEventData.events.map((event) =>
    parseDatesFromJson<Event>(event)
  );
  const eventRegistrations = mockEventData.eventRegistrations.map((reg) =>
    parseDatesFromJson<EventRegistration>(reg)
  );

  return { events, eventRegistrations };
}

// Load the data once and export it
export const { events, eventRegistrations } = loadEventData();
