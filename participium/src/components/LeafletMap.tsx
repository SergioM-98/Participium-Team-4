"use client";

import { LatLngExpression } from "leaflet";
import { Polygon } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import LocationDisplay from "./LocationDisplay";

import MapBase from "./map/MapBase";
import MapPolygons from "./map/MapPolygons";
import MapMarkers from "./map/MapMarkers";
import { extractVisualizationPolygons } from "./map/utils";
import ReportsClusterLayer from "./map/ReportsClusterLayer";
import { Report, Bounds } from "../app/lib/dtos/map.dto"; 

import torinoGeoJSON from "@/data/torino-boundary.json";

const COLOR = "#17138f";

const faLocationDotSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="36" height="36">
  <path fill="${COLOR}" fill-opacity="0.75" d="M128 252.6C128 148.4 214 64 320 64C426 64 512 148.4 512 252.6C512 371.9 391.8 514.9 341.6 569.4C329.8 582.2 310.1 582.2 298.3 569.4C248.1 514.9 127.9 371.9 127.9 252.6zM320 320C355.3 320 384 291.3 384 256C384 220.7 355.3 192 320 192C284.7 192 256 220.7 256 256C256 291.3 284.7 320 320 320z"/>
</svg>`;

const customMarkerIcon = L.divIcon({
  className: '',
  html: faLocationDotSVG,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const worldCoordinates: [number, number][] = [
  [90, -180],
  [90, 180],
  [-90, 180],
  [-90, -180],
  [90, -180]
];

const cityPolygons = extractVisualizationPolygons(torinoGeoJSON);

interface ReportsLayerProps { 
    reports: Report[]; 
    onReportClick: (report: Report) => void;
    onClusterClick: (bounds: Bounds) => void;
}

export default function LeafletMap({ 
    onLocationSelect, 
    reportsLayer 
}: { 
    onLocationSelect?: (location: { lat: number; lng: number } | null) => void,
    reportsLayer?: ReportsLayerProps 
}) {
  const [markers, setMarkers] = useState<LatLngExpression[]>([]);

  const addOrResetMarker = (pos: LatLngExpression) => {
    setMarkers([pos]);
    if (onLocationSelect) {
      const latlng = Array.isArray(pos) ? { lat: pos[0], lng: pos[1] } : pos;
      onLocationSelect(latlng as { lat: number; lng: number });
    }
  };

  const selected = markers[0];
  const inverseMaskHoles = cityPolygons.length > 0 ? [worldCoordinates, ...cityPolygons] : [];

  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-500 w-full h-full">
      <MapBase>
        {inverseMaskHoles.length > 0 && (
          <Polygon
            positions={inverseMaskHoles as any}
            pathOptions={{
              color: 'transparent',
              fillColor: COLOR,
              fillOpacity: 0.1
            }}
          />
        )}
        <MapPolygons cityPolygons={cityPolygons} borderColor={COLOR} />
        

        {reportsLayer && (
            <ReportsClusterLayer 
                reports={reportsLayer.reports}
                onReportClick={reportsLayer.onReportClick}
                onClusterClick={reportsLayer.onClusterClick}
            />
        )}


        {onLocationSelect && (
            <MapMarkers
                markers={markers}
                onMapClick={addOrResetMarker}
                cityPolygons={cityPolygons}
                markerIcon={customMarkerIcon}
            />
        )}
      </MapBase>
      
      <div className="absolute top-3 right-3 z-[1000]">
        <LocationDisplay selected={selected} />
      </div>
    </div>
  );
}