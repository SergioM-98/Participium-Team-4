import { useState } from "react";
import { LatLngExpression } from "leaflet";

export function useMarkers() {
  const [markers, setMarkers] = useState<LatLngExpression[]>([]);

  function addOrResetMarker(pos: LatLngExpression) {
    setMarkers([pos]);
  }

  function clearMarkers() {
    setMarkers([]);
  }

  return { markers, addOrResetMarker, clearMarkers };
}
