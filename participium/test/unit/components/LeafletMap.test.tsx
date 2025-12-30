import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LeafletMap from "@/components/LeafletMap";
import { Report } from "@/app/lib/dtos/map.dto";

// Mock react-leaflet
jest.mock("react-leaflet", () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Polygon: ({ positions, pathOptions }: any) => (
    <div 
      data-testid="polygon"
      data-positions={JSON.stringify(positions)}
      data-color={pathOptions?.color}
    />
  ),
  useMap: () => ({
    flyTo: jest.fn(),
    getZoom: jest.fn(() => 13),
  }),
}));

// Mock components
jest.mock("@/components/map/MapBase", () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="map-base">{children}</div>,
}));

jest.mock("@/components/map/MapController", () => ({
  __esModule: true,
  default: ({ targetLocation }: any) => (
    <div data-testid="map-controller" data-target={JSON.stringify(targetLocation)} />
  ),
}));

jest.mock("@/components/map/MapPolygons", () => ({
  __esModule: true,
  default: () => <div data-testid="map-polygons" />,
}));

jest.mock("@/components/map/MapMarkers", () => ({
  __esModule: true,
  default: ({ markers, onMapClick, disabled }: any) => (
    <div 
      data-testid="map-markers"
      data-marker-count={markers.length}
      data-disabled={disabled}
      onClick={() => onMapClick && onMapClick([45.0, 7.0])}
    />
  ),
}));

jest.mock("@/components/map/ReportsClusterLayer", () => ({
  __esModule: true,
  default: ({ reports }: any) => (
    <div data-testid="reports-cluster-layer" data-report-count={reports.length} />
  ),
}));

jest.mock("@/components/map/AddressSearch", () => ({
  __esModule: true,
  default: ({ onLocationFound }: any) => (
    <button onClick={() => onLocationFound(45.0703, 7.6869)}>
      Search
    </button>
  ),
}));

jest.mock("@/components/map/utils", () => ({
  extractVisualizationPolygons: jest.fn(() => [
    [[45.1, 7.7], [45.2, 7.8], [45.1, 7.9]],
  ]),
}));

jest.mock("@/data/torino-boundary.json", () => ({}), { virtual: true });

describe("LeafletMap", () => {
  const mockOnLocationSelect = jest.fn();
  const mockOnReportClick = jest.fn();
  const mockOnClusterClick = jest.fn();

  const mockReports: Report[] = [
    {
      id: 1,
      title: "Test Report",
      description: "Test",
      category: "PUBLIC_LIGHTING",
      latitude: 45.0703,
      longitude: 7.6869,
      status: "PENDING",
      createdAt: new Date(),
      anonymous: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render map components", () => {
    render(<LeafletMap />);

    expect(screen.getByTestId("map-base")).toBeInTheDocument();
    expect(screen.getByTestId("map-controller")).toBeInTheDocument();
    expect(screen.getByTestId("map-polygons")).toBeInTheDocument();
  });

  it("should render MapMarkers when onLocationSelect is provided", () => {
    render(<LeafletMap onLocationSelect={mockOnLocationSelect} />);

    expect(screen.getByTestId("map-markers")).toBeInTheDocument();
  });

  it("should not render MapMarkers when onLocationSelect is not provided", () => {
    render(<LeafletMap />);

    expect(screen.queryByTestId("map-markers")).not.toBeInTheDocument();
  });

  it("should render reports layer when provided", () => {
    render(
      <LeafletMap
        reportsLayer={{
          reports: mockReports,
          onReportClick: mockOnReportClick,
          onClusterClick: mockOnClusterClick,
        }}
      />
    );

    const clusterLayer = screen.getByTestId("reports-cluster-layer");
    expect(clusterLayer).toBeInTheDocument();
    expect(clusterLayer).toHaveAttribute("data-report-count", "1");
  });

  it("should call onLocationSelect when marker is added", () => {
    render(<LeafletMap onLocationSelect={mockOnLocationSelect} />);

    const mapMarkers = screen.getByTestId("map-markers");
    fireEvent.click(mapMarkers);

    expect(mockOnLocationSelect).toHaveBeenCalled();
  });

  it("should render AddressSearch component", () => {
    render(<LeafletMap />);

    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("should update map view when address is found", () => {
    render(<LeafletMap onLocationSelect={mockOnLocationSelect} />);

    const searchButton = screen.getByRole("button", { name: /search/i });
    fireEvent.click(searchButton);

    const controller = screen.getByTestId("map-controller");
    expect(controller).toBeInTheDocument();
  });

  it("should disable map click when allowMapClick is false", () => {
    render(<LeafletMap onLocationSelect={mockOnLocationSelect} allowMapClick={false} />);

    const mapMarkers = screen.getByTestId("map-markers");
    expect(mapMarkers).toHaveAttribute("data-disabled", "true");
  });

  it("should enable map click by default", () => {
    render(<LeafletMap onLocationSelect={mockOnLocationSelect} />);

    const mapMarkers = screen.getByTestId("map-markers");
    expect(mapMarkers).toHaveAttribute("data-disabled", "false");
  });

  it("should reset marker when new location is selected", () => {
    render(<LeafletMap onLocationSelect={mockOnLocationSelect} />);

    const mapMarkers = screen.getByTestId("map-markers");
    
    fireEvent.click(mapMarkers);
    expect(mockOnLocationSelect).toHaveBeenCalledTimes(1);

    fireEvent.click(mapMarkers);
    expect(mockOnLocationSelect).toHaveBeenCalledTimes(2);
  });

  it("should render polygon for city boundaries", () => {
    render(<LeafletMap />);

    const polygon = screen.getByTestId("polygon");
    expect(polygon).toBeInTheDocument();
  });

  it("should handle multiple reports in cluster layer", () => {
    const multipleReports: Report[] = [
      ...mockReports,
      {
        id: 2,
        title: "Second Report",
        description: "Test 2",
        category: "ROAD_MAINTENANCE",
        latitude: 45.0704,
        longitude: 7.687,
        status: "PENDING",
        createdAt: new Date(),
        anonymous: false,
      },
    ];

    render(
      <LeafletMap
        reportsLayer={{
          reports: multipleReports,
          onReportClick: mockOnReportClick,
          onClusterClick: mockOnClusterClick,
        }}
      />
    );

    const clusterLayer = screen.getByTestId("reports-cluster-layer");
    expect(clusterLayer).toHaveAttribute("data-report-count", "2");
  });
});
