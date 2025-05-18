"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface LocationMapProps {
  latitude?: number;
  longitude?: number;
  address: string;
  className?: string;
  height?: string;
}

function LocationMarker({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, map.getZoom());
  }, [map, position]);

  return (
    <Marker position={position}>
      <Popup>Event Location</Popup>
    </Marker>
  );
}

export function LocationMap({
  latitude,
  longitude,
  address,
  className,
  height = "300px",
}: LocationMapProps) {
  // Default to a central location if coordinates not provided
  const defaultPosition: [number, number] = [40.7128, -74.006]; // New York
  const hasCoordinates = latitude !== undefined && longitude !== undefined;
  const position: [number, number] = hasCoordinates
    ? [latitude, longitude]
    : defaultPosition;

  // Fix for Leaflet default marker icon in Next.js
  useEffect(() => {
    // This code only runs on the client side
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <div style={{ height }} className={className}>
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} />
      </MapContainer>
      <p className="mt-2 text-sm text-muted-foreground">{address}</p>
    </div>
  );
}
