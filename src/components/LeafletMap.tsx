"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L, { LatLngExpression, LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import LocationDisplay from "./LocationDisplay";

// Fix icona marker (404)
const markerIcon2x = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png";
const markerIcon = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png";
const markerShadow = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MarkersManager({ markers, onMapClick }: { markers: LatLngExpression[]; onMapClick: (pos: LatLngExpression) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onMapClick(e.latlng);
    },
  });
  return (
    <>
      {markers.map((pos, idx) => (
        <Marker key={idx} position={pos} />
      ))}
    </>
  );
}

export default function LeafletMap({ onLocationSelect }: { onLocationSelect?: (location: { lat: number; lng: number } | null) => void }) {
  const [markers, setMarkers] = useState<LatLngExpression[]>([]);

  const addOrResetMarker = (pos: LatLngExpression) => {
    setMarkers([pos]);
    // Notify parent component of the location selection
    if (onLocationSelect) {
      const latlng = Array.isArray(pos) ? { lat: pos[0], lng: pos[1] } : pos;
      onLocationSelect(latlng as { lat: number; lng: number });
    }
  };

  const selected = markers[0];

  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-500 w-full h-full">
      <MapContainer
        center={[45.0703, 7.6869]}
        zoom={13}
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkersManager markers={markers} onMapClick={addOrResetMarker} />
      </MapContainer>
      <div className="absolute top-3 right-3 z-[1000]">
        <LocationDisplay selected={selected} />
      </div>
    </div>
  );
}