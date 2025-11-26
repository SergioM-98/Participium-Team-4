import { Marker, useMapEvents } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import L from "leaflet";
import { isPointInPolygon } from "./utils";

export default function MapMarkers({
    markers,
    onMapClick,
    cityPolygons,
    markerIcon
}: {
    markers: LatLngExpression[];
    onMapClick: (pos: LatLngExpression) => void;
    cityPolygons: [number, number][][];
    markerIcon: L.DivIcon;
}) {
    useMapEvents({
        click(e) {
            // add markers only inside the city polygons
            if (
                cityPolygons.length > 0 &&
                cityPolygons.some((polygon) => isPointInPolygon(e.latlng, polygon))
            ) {
                onMapClick(e.latlng);
            } else if (cityPolygons.length === 0) {
                onMapClick(e.latlng);
            }
        },
    });
    return (
        <>
            {markers.map((pos, idx) => (
                <Marker key={idx} position={pos} icon={markerIcon} />
            ))}
        </>
    );
}
