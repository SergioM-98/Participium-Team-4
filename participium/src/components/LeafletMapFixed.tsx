"use client";

import { Polygon, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

import MapBase from "./map/MapBase";
import MapPolygons from "./map/MapPolygons";
import { extractVisualizationPolygons } from "./map/utils";
import ReportsClusterLayer from "./map/ReportsClusterLayer";
import { Report } from "@/app/lib/dtos/map.dto"; 

import torinoGeoJSON from "@/data/torino-boundary.json";
import { X } from "lucide-react";

const COLOR = "#17138f";



const worldCoordinates: [number, number][] = [
  [90, -180],
  [90, 180],
  [-90, 180],
  [-90, -180],
  [90, -180]
];

const cityPolygons = extractVisualizationPolygons(torinoGeoJSON);

// componente interno per posizionare la MapContainer già creata in MapBase
function SetViewOnReport({ report, zoom }: { report: Report; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (!report) return;
    const { latitude, longitude } = report as Report & { latitude?: number; longitude?: number };
    if (typeof latitude === "number" && typeof longitude === "number") {
      // setView invece di passare props a MapBase (MapBase non accetta center/zoom)
      map.setView([latitude, longitude], zoom ?? map.getZoom(), { animate: false });
    }
  }, [map, report, zoom]);
  return null;
}

export default function LeafletMapFixed({
    report,
    showCloseButton,
    onClose,
    className = ""
}: Readonly<{ 
    report: Report,
    showCloseButton: boolean,
    onClose?: () => void,
    className?: string
}>) {
 
  const inverseMaskHoles = cityPolygons.length > 0 ? [worldCoordinates, ...cityPolygons] : [];
 
  return (
    <div className={`relative rounded-xl overflow-hidden shadow-lg border border-gray-500 w-full h-full ${className}`}>
      {showCloseButton && (
        <button
          aria-label="Close map"
          onClick={onClose}
          className="absolute top-3 right-3 z-[9999] pointer-events-auto bg-background/90 dark:bg-background/90 rounded-md p-1 shadow hover:opacity-90"
        >
          <X className="w-5 h-5" />
        </button>
      )}
      <MapBase>
        <SetViewOnReport report={report} zoom={15} />

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
        
        {report && (
            <ReportsClusterLayer 
                reports={[report]}
                onReportClick={() => {}}
                onClusterClick={() => {}}
            />
        )}
      </MapBase>
    </div>
  );
}