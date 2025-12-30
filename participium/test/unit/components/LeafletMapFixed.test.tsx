import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LeafletMapFixed from "@/components/LeafletMapFixed";
import { Report } from "@/app/lib/dtos/map.dto";

// Mock react-leaflet components
jest.mock("react-leaflet", () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Polygon: ({ positions, pathOptions }: any) => (
    <div 
      data-testid="polygon" 
      data-positions={JSON.stringify(positions)}
      data-color={pathOptions?.color}
      data-fill-color={pathOptions?.fillColor}
    />
  ),
  useMap: () => ({
    setView: jest.fn(),
    getZoom: jest.fn(() => 13),
  }),
}));

// Mock MapBase
jest.mock("@/components/map/MapBase", () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="map-base">{children}</div>,
}));

// Mock MapPolygons
jest.mock("@/components/map/MapPolygons", () => ({
  __esModule: true,
  default: ({ cityPolygons, borderColor }: any) => (
    <div data-testid="map-polygons" data-border-color={borderColor} />
  ),
}));

// Mock ReportsClusterLayer
jest.mock("@/components/map/ReportsClusterLayer", () => ({
  __esModule: true,
  default: ({ reports }: any) => (
    <div data-testid="reports-cluster-layer" data-report-count={reports.length} />
  ),
}));

// Mock utils
jest.mock("@/components/map/utils", () => ({
  extractVisualizationPolygons: jest.fn(() => [
    [[45.1, 7.7], [45.2, 7.8], [45.1, 7.9]],
  ]),
}));

// Mock GeoJSON
jest.mock("@/data/torino-boundary.json", () => ({}), { virtual: true });

describe("LeafletMapFixed", () => {
  const mockReport: Report = {
    id: 1,
    title: "Test Report",
    description: "Test description",
    category: "PUBLIC_LIGHTING",
    latitude: 45.0703,
    longitude: 7.6869,
    status: "PENDING",
    createdAt: new Date(),
    anonymous: false,
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render map with report", () => {
    render(
      <LeafletMapFixed
        report={mockReport}
        showCloseButton={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByTestId("map-base")).toBeInTheDocument();
    expect(screen.getByTestId("map-polygons")).toBeInTheDocument();
    expect(screen.getByTestId("reports-cluster-layer")).toBeInTheDocument();
  });

  it("should display close button when showCloseButton is true", () => {
    render(
      <LeafletMapFixed
        report={mockReport}
        showCloseButton={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole("button", { name: /close map/i });
    expect(closeButton).toBeInTheDocument();
  });

  it("should not display close button when showCloseButton is false", () => {
    render(
      <LeafletMapFixed
        report={mockReport}
        showCloseButton={false}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.queryByRole("button", { name: /close map/i });
    expect(closeButton).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <LeafletMapFixed
        report={mockReport}
        showCloseButton={false}
        onClose={mockOnClose}
        className="custom-class"
      />
    );

    const mapContainer = container.querySelector(".custom-class");
    expect(mapContainer).toBeInTheDocument();
  });

  it("should render report in cluster layer", () => {
    render(
      <LeafletMapFixed
        report={mockReport}
        showCloseButton={false}
        onClose={mockOnClose}
      />
    );

    const clusterLayer = screen.getByTestId("reports-cluster-layer");
    expect(clusterLayer).toHaveAttribute("data-report-count", "1");
  });

  it("should render MapPolygons with correct border color", () => {
    render(
      <LeafletMapFixed
        report={mockReport}
        showCloseButton={false}
        onClose={mockOnClose}
      />
    );

    const mapPolygons = screen.getByTestId("map-polygons");
    expect(mapPolygons).toHaveAttribute("data-border-color", "#17138f");
  });

  it("should render map with default className", () => {
    const { container } = render(
      <LeafletMapFixed
        report={mockReport}
        showCloseButton={false}
        onClose={mockOnClose}
      />
    );

    const mapContainer = container.querySelector(".relative.rounded-xl");
    expect(mapContainer).toBeInTheDocument();
  });
});
