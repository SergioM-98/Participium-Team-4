import { render } from "@testing-library/react";
import MapMarkers from "@/components/map/MapMarkers";
import L from "leaflet";

// Mock react-leaflet
jest.mock("react-leaflet", () => ({
  Marker: ({ children, ...props }: any) => (
    <div data-testid="marker" data-position={JSON.stringify(props.position)}>
      {children}
    </div>
  ),
  useMapEvents: jest.fn(() => null),
}));

// Mock utils
jest.mock("@/components/map/utils", () => ({
  isPointInPolygon: jest.fn(() => true),
}));

describe("MapMarkers", () => {
  const mockIcon = L.divIcon({ className: "test-icon" });
  const mockOnMapClick = jest.fn();
  const mockPolygons: [number, number][][] = [
    [[45.0, 7.5], [45.1, 7.5], [45.1, 7.7], [45.0, 7.7]]
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render without markers", () => {
    const { container } = render(
      <MapMarkers
        markers={[]}
        onMapClick={mockOnMapClick}
        cityPolygons={mockPolygons}
        markerIcon={mockIcon}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it("should render single marker", () => {
    const markers: [number, number][] = [[45.0703, 7.6869]];
    const { getAllByTestId } = render(
      <MapMarkers
        markers={markers}
        onMapClick={mockOnMapClick}
        cityPolygons={mockPolygons}
        markerIcon={mockIcon}
      />
    );
    expect(getAllByTestId("marker")).toHaveLength(1);
  });

  it("should render multiple markers", () => {
    const markers: [number, number][] = [
      [45.0703, 7.6869],
      [45.0750, 7.6900],
      [45.0800, 7.7000],
    ];
    const { getAllByTestId } = render(
      <MapMarkers
        markers={markers}
        onMapClick={mockOnMapClick}
        cityPolygons={mockPolygons}
        markerIcon={mockIcon}
      />
    );
    expect(getAllByTestId("marker")).toHaveLength(3);
  });

  it("should pass correct position to each marker", () => {
    const markers: [number, number][] = [
      [45.0703, 7.6869],
      [45.0750, 7.6900],
    ];
    const { getAllByTestId } = render(
      <MapMarkers
        markers={markers}
        onMapClick={mockOnMapClick}
        cityPolygons={mockPolygons}
        markerIcon={mockIcon}
      />
    );
    const markerElements = getAllByTestId("marker");
    expect(markerElements[0]).toHaveAttribute(
      "data-position",
      JSON.stringify(markers[0])
    );
  });

  it("should handle disabled prop", () => {
    const { container } = render(
      <MapMarkers
        markers={[]}
        onMapClick={mockOnMapClick}
        cityPolygons={mockPolygons}
        markerIcon={mockIcon}
        disabled={true}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it("should handle empty cityPolygons", () => {
    const markers: [number, number][] = [[45.0703, 7.6869]];
    const { getAllByTestId } = render(
      <MapMarkers
        markers={markers}
        onMapClick={mockOnMapClick}
        cityPolygons={[]}
        markerIcon={mockIcon}
      />
    );
    expect(getAllByTestId("marker")).toHaveLength(1);
  });

  it("should render markers with unique keys", () => {
    const markers: [number, number][] = [
      [45.0703, 7.6869],
      [45.0703, 7.6869], // Duplicate position
    ];
    const { getAllByTestId } = render(
      <MapMarkers
        markers={markers}
        onMapClick={mockOnMapClick}
        cityPolygons={mockPolygons}
        markerIcon={mockIcon}
      />
    );
    // Should render both even with same position
    expect(getAllByTestId("marker")).toHaveLength(2);
  });
});
