"use client";

import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon, LatLngTuple } from "leaflet";
import { useEffect, useState } from "react";

// Fix for default marker icon in Leaflet with Next.js
const DEFAULT_CENTER: LatLngTuple = [51.505, -0.09];

interface LocationMapProps {
  address: string;
}

export function LocationMap({ address }: LocationMapProps) {
  const [coordinates, setCoordinates] = useState<LatLngTuple | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const geocodeAddress = async () => {
      try {
        // Using OpenStreetMap Nominatim API for geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            address
          )}`
        );
        const data = await response.json();

        if (data && data[0]) {
          setCoordinates([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          setError("Location not found");
        }
      } catch (err) {
        setError("Error loading map");
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      geocodeAddress();
    }
  }, [address]);

  // Custom icon setup
  const customIcon = new Icon({
    iconUrl: "/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  if (loading) {
    return <div className="h-64 w-full animate-pulse bg-gray-200 rounded-lg" />;
  }

  if (error) {
    return (
      <div className="h-64 w-full flex items-center justify-center bg-gray-100 rounded-lg text-gray-500">
        {error}
      </div>
    );
  }

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden">
      <MapContainer
        center={coordinates || DEFAULT_CENTER}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {coordinates && <Marker position={coordinates} icon={customIcon} />}
      </MapContainer>
    </div>
  );
}
