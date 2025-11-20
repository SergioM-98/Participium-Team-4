import { LatLng } from "leaflet";

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
