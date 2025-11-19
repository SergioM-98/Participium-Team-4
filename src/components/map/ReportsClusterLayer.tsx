// src/components/map/ReportsClusterLayer.tsx
"use client";

import { Marker, useMap } from 'react-leaflet';
import L, { divIcon, Point } from 'leaflet';
import { useState, useMemo } from 'react';
import MarkerClusterGroup from 'react-leaflet-markercluster'; 
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// 💡 Importa i tipi dal DTO centralizzato
import { Report, Bounds } from "@/app/lib/dtos/map.dto"; 

// --- Interfaccia Props ---
interface ReportsClusterLayerProps {
    reports: Report[];
    onReportClick: (report: Report) => void;
    onClusterClick: (bounds: Bounds) => void; 
}

// --- Icona Personalizzata (Singolo Marker) ---
const REPORT_ICON = L.divIcon({
    className: 'report-marker-icon', 
    html: `
        <div style="background-color: oklch(var(--primary)); color: oklch(var(--primary-foreground));" 
             class="p-1 rounded-full shadow-md">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-megaphone">
                <path d="m3 11 18 2v4H3z"/><path d="M12 11v6"/><path d="M3 15h18"/><path d="m11 5 6 4"/>
             </svg>
        </div>
    `,
    iconSize: new Point(24, 24),
    iconAnchor: new Point(12, 24),
});

// --- Funzione Creazione Icona Cluster ---
const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  let sizeClass = 'size-8'; 
  
  if (count >= 10 && count < 100) {
    sizeClass = 'size-10';
  } else if (count >= 100) {
    sizeClass = 'size-12';
  }

  return divIcon({
    html: `<div class="flex items-center justify-center font-bold shadow-lg rounded-full ${sizeClass}">${count}</div>`,
    className: `leaflet-marker-cluster leaflet-marker-cluster-custom`,
    iconSize: new Point(48, 48), 
  });
};


export default function ReportsClusterLayer({ 
    reports, 
    onReportClick, 
    onClusterClick 
}: ReportsClusterLayerProps) {
    const map = useMap();
    const [mapReady, setMapReady] = useState(false);

    if (!mapReady && map) {
        setMapReady(true);
    }

    const handleClusterClick = useMemo(() => (cluster: any) => {
        const clusterBounds = cluster.layer.getBounds();
        
        const bounds: Bounds = {
            north: clusterBounds.getNorth(),
            south: clusterBounds.getSouth(),
            east: clusterBounds.getEast(),
            west: clusterBounds.getWest(),
        };

        // Chiama la callback che invoca la Server Action
        onClusterClick(bounds);
        
    }, [onClusterClick]);
    
    if (!mapReady) return null;

    return (
        <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={80} 
            iconCreateFunction={createClusterCustomIcon} 
            eventHandlers={{
                clusterclick: handleClusterClick
            }}
        >
            {reports.map((report) => (
                <Marker
                    key={report.id}
                    position={[report.latitude, report.longitude]}
                    icon={REPORT_ICON}
                    eventHandlers={{
                        click: () => onReportClick(report), 
                    }}
                />
            ))}
        </MarkerClusterGroup>
    );
}