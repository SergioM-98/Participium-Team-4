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

export default function LeafletMap() {
  const [markers, setMarkers] = useState<LatLngExpression[]>([]);
  
  const addOrResetMarker = (pos: LatLngExpression) => {
    setMarkers([pos]);
  };
  
  const selected = markers[0];
  
  return (
    <>
      <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-500" style={{ width: "100%", maxWidth: 900, height: 500 }}>
        <MapContainer center={[45.0703, 7.6869]} zoom={13} style={{ height: "100%", width: "100%" }}>
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
    </>
  );
}