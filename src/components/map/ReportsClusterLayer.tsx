"use client";

import { Marker, useMap } from 'react-leaflet';
import L, { divIcon, Point } from 'leaflet';
import { useState, useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server'; 
import MarkerClusterGroup from 'react-leaflet-markercluster'; 
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import { Report, Bounds } from "@/app/lib/dtos/map.dto"; 
import { ReportMarkerIcon, ClusterMarkerIcon } from './MapIcons'; 

// Funzione helper per creare l'icona dinamica per categoria
const createReportIcon = (category: string) => {
    const reportIconHtml = renderToStaticMarkup(<ReportMarkerIcon category={category} />);
    
    return L.divIcon({
        className: 'report-marker-icon', 
        html: reportIconHtml,
        iconSize: new Point(40, 40), 
        iconAnchor: new Point(20, 20),
    });
};

// Cache semplice per evitare di rigenerare stringhe HTML identiche
const iconCache: Record<string, L.DivIcon> = {};
const getCachedIcon = (category: string) => {
    if (!iconCache[category]) {
        iconCache[category] = createReportIcon(category);
    }
    return iconCache[category];
};

// --- Funzione Generazione Cluster ---
const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  
  // Dimensioni dinamiche
  let size = 40;
  if (count >= 10) size = 48;
  if (count >= 100) size = 56;

  const clusterHtml = renderToStaticMarkup(
    <ClusterMarkerIcon count={count} />
  );

  return divIcon({
    html: clusterHtml,
    className: 'leaflet-marker-cluster-custom',
    iconSize: new Point(size, size), 
  });
};

interface ReportsClusterLayerProps {
    reports: Report[];
    onReportClick: (report: Report) => void;
    onClusterClick: (bounds: Bounds) => void; 
}

export default function ReportsClusterLayer({ 
    reports, 
    onReportClick, 
    onClusterClick 
}: Readonly<ReportsClusterLayerProps>) {
    const map = useMap();
    const [mapReady, setMapReady] = useState(false);

    if (!mapReady && map) {
        setMapReady(true);
    }

    const handleClusterClick = useMemo(() => (cluster: any) => {
        L.DomEvent.stopPropagation(cluster.originalEvent);

        const clusterBounds = cluster.layer.getBounds();
        const bounds: Bounds = {
            north: clusterBounds.getNorth(),
            south: clusterBounds.getSouth(),
            east: clusterBounds.getEast(),
            west: clusterBounds.getWest(),
        };

        onClusterClick(bounds);
    }, [onClusterClick]);
    
    if (!mapReady) return null;

    return (
        <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={60}
            spiderfyOnMaxZoom={false} 
            showCoverageOnHover={false} 
            zoomToBoundsOnClick={false} 
            iconCreateFunction={createClusterCustomIcon} 
            eventHandlers={{
                clusterclick: handleClusterClick
            }}
        >
            {reports.map((report) => (
                <Marker
                    key={report.id}
                    position={[report.latitude, report.longitude]}
                    icon={getCachedIcon(report.category)}
                    eventHandlers={{
                        click: (e) => {
                            L.DomEvent.stopPropagation(e.originalEvent);
                            onReportClick(report);
                        }, 
                    }}
                />
            ))}
        </MarkerClusterGroup>
    );
}