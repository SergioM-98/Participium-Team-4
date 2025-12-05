"use client";

import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { useCallback } from 'react';
import MarkerClusterGroup from 'react-leaflet-markercluster'; 
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import { Report, Bounds } from "@/app/lib/dtos/map.dto"; 
import { createReportIcon, createClusterCustomIcon } from './utils'; 

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
    
    const handleClusterClick = useCallback((cluster: any) => {
        L.DomEvent.stopPropagation(cluster.originalEvent);

        const clusterBounds = cluster.layer.getBounds();
        onClusterClick({
            north: clusterBounds.getNorth(),
            south: clusterBounds.getSouth(),
            east: clusterBounds.getEast(),
            west: clusterBounds.getWest(),
        });
    }, [onClusterClick]);

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
                    icon={createReportIcon(report.category, report.status)}
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