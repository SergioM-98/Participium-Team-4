import React from "react";
import { LatLngExpression } from "leaflet";

interface LocationDisplayProps {
  selected?: LatLngExpression | null;
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({ selected }) => {
  return (
    <div className="mt-4 flex justify-center min-h-[36px]">
      {selected ? (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/90 border border-gray-300 text-black font-mono text-xs sm:text-sm shadow-sm">
          {Array.isArray(selected) ? (
            <span>
              <span className="block sm:inline">Latitude: {selected[0].toFixed(5)},</span>
              <span className="block sm:inline"> Longitude: {selected[1].toFixed(5)}</span>
            </span>
          ) : selected && typeof selected === 'object' && 'lat' in selected && 'lng' in selected ? (
            <span>
              <span className="block sm:inline">Latitude: {selected.lat.toFixed(5)},</span>
              <span className="block sm:inline"> Longitude: {selected.lng.toFixed(5)}</span>
            </span>
          ) : (
            JSON.stringify(selected)
          )}
        </span>
      ) : (
        <span className="inline-block px-3 py-1 rounded-xl bg-gray-100/90 border border-gray-200 text-gray-400 font-mono text-xs sm:text-sm">No location selected</span>
      )}
    </div>
  );
};

export default LocationDisplay;
