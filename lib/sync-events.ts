"use client";

// This file provides functions to synchronize events between client and server events arrays
import { events as serverEvents } from "./server-events";
import { Event } from "./events-db";

/**
 * Synchronize an updated event from client to server array
 * @param updatedEvent The event that has been updated on the client
 */
export function syncEventUpdate(updatedEvent: Event): void {
  const eventIndex = serverEvents.findIndex(
    (event) => event.id === updatedEvent.id
  );
  if (eventIndex !== -1) {
    // Make sure we preserve Date objects properly
    const updatedServerEvent = { ...updatedEvent };

    // Convert date strings back to Date objects if needed
    if (typeof updatedServerEvent.date === "string") {
      updatedServerEvent.date = new Date(updatedServerEvent.date);
    }

    if (
      updatedServerEvent.endDate &&
      typeof updatedServerEvent.endDate === "string"
    ) {
      updatedServerEvent.endDate = new Date(updatedServerEvent.endDate);
    }

    if (
      updatedServerEvent.registrationDeadline &&
      typeof updatedServerEvent.registrationDeadline === "string"
    ) {
      updatedServerEvent.registrationDeadline = new Date(
        updatedServerEvent.registrationDeadline
      );
    }

    if (
      updatedServerEvent.createdAt &&
      typeof updatedServerEvent.createdAt === "string"
    ) {
      updatedServerEvent.createdAt = new Date(updatedServerEvent.createdAt);
    }

    if (
      updatedServerEvent.updatedAt &&
      typeof updatedServerEvent.updatedAt === "string"
    ) {
      updatedServerEvent.updatedAt = new Date(updatedServerEvent.updatedAt);
    }

    serverEvents[eventIndex] = updatedServerEvent;
  }
}

/**
 * Synchronize a new event from client to server array
 * @param newEvent The event that has been created on the client
 */
export function syncEventCreate(newEvent: Event): void {
  // Make sure we preserve Date objects properly
  const newServerEvent = { ...newEvent };

  // Convert date strings back to Date objects if needed
  if (typeof newServerEvent.date === "string") {
    newServerEvent.date = new Date(newServerEvent.date);
  }

  if (newServerEvent.endDate && typeof newServerEvent.endDate === "string") {
    newServerEvent.endDate = new Date(newServerEvent.endDate);
  }

  if (
    newServerEvent.registrationDeadline &&
    typeof newServerEvent.registrationDeadline === "string"
  ) {
    newServerEvent.registrationDeadline = new Date(
      newServerEvent.registrationDeadline
    );
  }

  if (
    newServerEvent.createdAt &&
    typeof newServerEvent.createdAt === "string"
  ) {
    newServerEvent.createdAt = new Date(newServerEvent.createdAt);
  }

  if (
    newServerEvent.updatedAt &&
    typeof newServerEvent.updatedAt === "string"
  ) {
    newServerEvent.updatedAt = new Date(newServerEvent.updatedAt);
  }

  serverEvents.push(newServerEvent);
}

/**
 * Synchronize event deletion from client to server array
 * @param eventId The ID of the event that has been deleted on the client
 */
export function syncEventDelete(eventId: string): void {
  const eventIndex = serverEvents.findIndex((event) => event.id === eventId);
  if (eventIndex !== -1) {
    serverEvents.splice(eventIndex, 1);
  }
}

/**
 * Helper function to ensure dates are properly converted from strings to Date objects
 * @param event The event object to process
 */
export function ensureDateObjects(event: Partial<Event>): Partial<Event> {
  const processedEvent = { ...event };

  if (processedEvent.date && typeof processedEvent.date === "string") {
    processedEvent.date = new Date(processedEvent.date);
  }

  if (processedEvent.endDate && typeof processedEvent.endDate === "string") {
    processedEvent.endDate = new Date(processedEvent.endDate);
  }

  if (
    processedEvent.registrationDeadline &&
    typeof processedEvent.registrationDeadline === "string"
  ) {
    processedEvent.registrationDeadline = new Date(
      processedEvent.registrationDeadline
    );
  }

  if (
    processedEvent.createdAt &&
    typeof processedEvent.createdAt === "string"
  ) {
    processedEvent.createdAt = new Date(processedEvent.createdAt);
  }

  if (
    processedEvent.updatedAt &&
    typeof processedEvent.updatedAt === "string"
  ) {
    processedEvent.updatedAt = new Date(processedEvent.updatedAt);
  }

  return processedEvent;
}
