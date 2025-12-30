import { render } from "@testing-library/react";
import ReportsClusterLayer from "@/components/map/ReportsClusterLayer";
import { Report } from "@/app/lib/dtos/map.dto";

// Mock leaflet and react-leaflet
jest.mock("react-leaflet", () => ({
  Marker: ({ children, ...props }: any) => (
    <div data-testid="marker" data-position={JSON.stringify(props.position)}>
      {children}
    </div>
  ),
}));

jest.mock("react-leaflet-markercluster", () => {
  return function MockMarkerClusterGroup({ children }: any) {
    return <div data-testid="marker-cluster-group">{children}</div>;
  };
});

jest.mock("@/components/map/utils", () => ({
  createReportIcon: jest.fn(() => ({ options: { className: "test-icon" } })),
  createClusterCustomIcon: jest.fn(() => ({ options: { className: "cluster-icon" } })),
}));

describe("ReportsClusterLayer", () => {
  const mockOnReportClick = jest.fn();
  const mockOnClusterClick = jest.fn();

  const mockReports: Report[] = [
    {
      id: "1",
      latitude: 45.0703,
      longitude: 7.6869,
      category: "WATER_SUPPLY",
      status: "PENDING_APPROVAL",
    },
    {
      id: "2",
      latitude: 45.0750,
      longitude: 7.6900,
      category: "WASTE",
      status: "IN_PROGRESS",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render MarkerClusterGroup", () => {
    const { getByTestId } = render(
      <ReportsClusterLayer
        reports={mockReports}
        onReportClick={mockOnReportClick}
        onClusterClick={mockOnClusterClick}
      />
    );
    expect(getByTestId("marker-cluster-group")).toBeInTheDocument();
  });

  it("should render markers for each report", () => {
    const { getAllByTestId } = render(
      <ReportsClusterLayer
        reports={mockReports}
        onReportClick={mockOnReportClick}
        onClusterClick={mockOnClusterClick}
      />
    );
    const markers = getAllByTestId("marker");
    expect(markers).toHaveLength(2);
  });

  it("should pass correct position to each marker", () => {
    const { getAllByTestId } = render(
      <ReportsClusterLayer
        reports={mockReports}
        onReportClick={mockOnReportClick}
        onClusterClick={mockOnClusterClick}
      />
    );
    const markers = getAllByTestId("marker");
    expect(markers[0]).toHaveAttribute(
      "data-position",
      JSON.stringify([45.0703, 7.6869])
    );
    expect(markers[1]).toHaveAttribute(
      "data-position",
      JSON.stringify([45.0750, 7.6900])
    );
  });

  it("should render without reports", () => {
    const { getByTestId, queryAllByTestId } = render(
      <ReportsClusterLayer
        reports={[]}
        onReportClick={mockOnReportClick}
        onClusterClick={mockOnClusterClick}
      />
    );
    expect(getByTestId("marker-cluster-group")).toBeInTheDocument();
    expect(queryAllByTestId("marker")).toHaveLength(0);
  });

  it("should handle single report", () => {
    const { getAllByTestId } = render(
      <ReportsClusterLayer
        reports={[mockReports[0]]}
        onReportClick={mockOnReportClick}
        onClusterClick={mockOnClusterClick}
      />
    );
    expect(getAllByTestId("marker")).toHaveLength(1);
  });

  it("should handle large number of reports", () => {
    const manyReports: Report[] = Array.from({ length: 100 }, (_, i) => ({
      id: `report-${i}`,
      latitude: 45.0 + i * 0.001,
      longitude: 7.6 + i * 0.001,
      category: "WATER_SUPPLY",
      status: "PENDING_APPROVAL",
    }));

    const { getAllByTestId } = render(
      <ReportsClusterLayer
        reports={manyReports}
        onReportClick={mockOnReportClick}
        onClusterClick={mockOnClusterClick}
      />
    );
    expect(getAllByTestId("marker")).toHaveLength(100);
  });

  it("should render markers with unique keys", () => {
    const { container } = render(
      <ReportsClusterLayer
        reports={mockReports}
        onReportClick={mockOnReportClick}
        onClusterClick={mockOnClusterClick}
      />
    );
    // Check that markers are rendered (React will warn if keys are duplicated)
    const markers = container.querySelectorAll('[data-testid="marker"]');
    expect(markers).toHaveLength(2);
  });

  it("should handle reports with different categories and statuses", () => {
    const diverseReports: Report[] = [
      {
        id: "1",
        latitude: 45.0703,
        longitude: 7.6869,
        category: "WATER_SUPPLY",
        status: "PENDING_APPROVAL",
      },
      {
        id: "2",
        latitude: 45.0750,
        longitude: 7.6900,
        category: "WASTE",
        status: "RESOLVED",
      },
      {
        id: "3",
        latitude: 45.0800,
        longitude: 7.7000,
        category: "PUBLIC_LIGHTING",
        status: "REJECTED",
      },
    ];

    const { getAllByTestId } = render(
      <ReportsClusterLayer
        reports={diverseReports}
        onReportClick={mockOnReportClick}
        onClusterClick={mockOnClusterClick}
      />
    );
    expect(getAllByTestId("marker")).toHaveLength(3);
  });
});
