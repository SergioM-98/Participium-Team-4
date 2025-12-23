import { Marker, useMapEvents } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import { isPointInPolygon } from "./utils";

export default function MapMarkers({
    markers,
    onMapClick,
    cityPolygons,
    markerIcon,
    disabled = false
}: Readonly<{
    markers: LatLngExpression[];
    onMapClick: (pos: LatLngExpression) => void;
    cityPolygons: [number, number][][];
    markerIcon: L.DivIcon;
    disabled?: boolean;
}>) {
    useMapEvents({
        click(e) {
            if (disabled) return;
            // add markers only inside the city polygons
            if (
                cityPolygons.some((polygon) => isPointInPolygon(e.latlng, polygon)) ||
                cityPolygons.length === 0
            ) {
                onMapClick(e.latlng);
            }
        },
    });
    return (
        <>
            {markers.map((pos, index) => (
                <Marker key={index} position={pos} icon={markerIcon} />
            ))}
        </>
    );
}
