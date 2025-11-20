// src/components/map/map-utils.tsx
import { LatLng, divIcon, Point } from "leaflet";
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReportMarkerIcon, ClusterMarkerIcon } from './MapIcons';

// --- GEOMETRY UTILS (from utils.ts) ---

// extract from a GeoJSON object the polygons to be visualized on the map
export function extractVisualizationPolygons(geoJson: any): [number, number][][] {
    const allPolygons: [number, number][][] = [];

    if (!geoJson.features || geoJson.features.length === 0) return allPolygons;

    const geometry = geoJson.features[0].geometry;
    const coordinates = geometry.coordinates;

    const processRings = (rings: any[]) => {
        if (!rings || rings.length === 0) return;
        const outerRing = rings[0];
        if (Array.isArray(outerRing) && Array.isArray(outerRing[0])) {
            const invertedRing = outerRing.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
            allPolygons.push(invertedRing);
        }
    };

    if (geometry.type === "Polygon") {
        processRings(coordinates);
    } else if (geometry.type === "MultiPolygon") {
        coordinates.forEach((polygonRings: any[]) => {
            processRings(polygonRings);
        });
    }

    return allPolygons;
}

// check if a point is inside a polygon using the ray-casting algorithm
export function isPointInPolygon(point: LatLng, polygon: [number, number][]): boolean {
    // point coordinates
    const x = point.lng;
    const y = point.lat;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        // Take the two vertices of the current edge
        const yi = polygon[i][0];
        const xi = polygon[i][1];
        const yj = polygon[j][0];
        const xj = polygon[j][1];

        // Check if the edge crosses the horizontal line passing through the point
        const intersect =
            ((yi > y) !== (yj > y)) &&
            x < ((xj - xi) * (y - yi)) / (yj - yi + Number.EPSILON) + xi;

        // If there is an intersection, toggle the inside state (in/out)
        if (intersect) inside = !inside;
    }

    // return the point status
    return inside;
}

// --- LAYER & ICON UTILS (from layer-utils.tsx) ---

// Cache to avoid regenerating HTML for the same icon multiple times
const iconCache: Record<string, L.DivIcon> = {};

export const createReportIcon = (category: string) => {
    if (!iconCache[category]) {
        const reportIconHtml = renderToStaticMarkup(<ReportMarkerIcon category={category} />);
        
        iconCache[category] = L.divIcon({
            className: 'report-marker-icon', 
            html: reportIconHtml,
            iconSize: new Point(40, 40), 
            iconAnchor: new Point(20, 20),
        });
    }
    return iconCache[category];
};

export const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  
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