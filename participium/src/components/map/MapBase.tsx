import { MapContainer, TileLayer } from "react-leaflet";
import { LatLngBoundsExpression } from "leaflet";
import { ReactNode } from "react";

const maxBounds: LatLngBoundsExpression = [
  [45.0027, 7.5703],
  [45.144, 7.7783]
];

export default function MapBase({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <MapContainer
      center={[45.0703, 7.6869]}
      zoom={13}
      className="w-full h-full"
      style={{ width: "100%", height: "100%" }}
      maxBounds={maxBounds}
      maxBoundsViscosity={1}
      minZoom={11}
    >
    {/* layer for map background styling */}
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  );
}
