import { useMap } from "react-leaflet";
import { useEffect } from "react";
import { LatLngExpression } from "leaflet";

interface MapControllerProps {
  targetLocation: LatLngExpression | null;
  zoomLevel?: number;
}

export default function MapController({
  targetLocation,
  zoomLevel = 16,
}: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (targetLocation) {
      map.flyTo(targetLocation, zoomLevel, {
        animate: true,
        duration: 1.5, // Smooth animation
      });
    }
  }, [targetLocation, zoomLevel, map]);

  return null;
}
