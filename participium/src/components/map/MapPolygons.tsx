import { Polygon } from "react-leaflet";

// design on the map every polygon provided inside the cityPolygons prop
export default function MapPolygons({ cityPolygons, borderColor }: Readonly<{ cityPolygons: [number, number][][], borderColor: string }>) {
    return (
        <>
            {cityPolygons.map((polygon) => (
                <Polygon
                    key={`polygon-${polygon[0].join('-')}`}
                    positions={polygon}
                    pathOptions={{ color: borderColor, fillOpacity: 0, weight: 1.5 }}
                />
            ))}
        </>
    );
}
