import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ClusterReportsSheet from "@/components/ClusterReportsSheet";
import { Report } from "@/app/lib/dtos/map.dto";

describe("ClusterReportsSheet", () => {
  const mockReports: Report[] = [
    {
      id: 1,
      title: "Broken Street Light",
      description: "Light is not working",
      category: "PUBLIC_LIGHTING",
      latitude: 45.0703,
      longitude: 7.6869,
      status: "PENDING",
      createdAt: new Date(),
      anonymous: false,
    },
    {
      id: 2,
      title: "Pothole on Main St",
      description: "Large pothole",
      category: "ROAD_MAINTENANCE",
      latitude: 45.0704,
      longitude: 7.687,
      status: "PENDING",
      createdAt: new Date(),
      anonymous: false,
    },
  ];

  const mockOnOpenChange = jest.fn();
  const mockOnReportClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render sheet title with report count", () => {
    render(
      <ClusterReportsSheet
        reports={mockReports}
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onReportClick={mockOnReportClick}
        isLoading={false}
      />
    );

    expect(screen.getByText("Reports in Cluster (2)")).toBeInTheDocument();
  });

  it("should display loading state", () => {
    render(
      <ClusterReportsSheet
        reports={[]}
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onReportClick={mockOnReportClick}
        isLoading={true}
      />
    );

    expect(screen.getByText("Loading reports...")).toBeInTheDocument();
    expect(screen.getByText("Reports in Cluster (...)")).toBeInTheDocument();
  });

  it("should display empty state when no reports", () => {
    render(
      <ClusterReportsSheet
        reports={[]}
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onReportClick={mockOnReportClick}
        isLoading={false}
      />
    );

    expect(screen.getByText("No reports found in this area.")).toBeInTheDocument();
  });

  it("should display all reports", () => {
    render(
      <ClusterReportsSheet
        reports={mockReports}
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onReportClick={mockOnReportClick}
        isLoading={false}
      />
    );

    expect(screen.getByText("Broken Street Light")).toBeInTheDocument();
    expect(screen.getByText("Pothole on Main St")).toBeInTheDocument();
    expect(screen.getByText("Category: PUBLIC LIGHTING")).toBeInTheDocument();
    expect(screen.getByText("Category: ROAD MAINTENANCE")).toBeInTheDocument();
  });

  it("should call onReportClick when report card is clicked", () => {
    render(
      <ClusterReportsSheet
        reports={mockReports}
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onReportClick={mockOnReportClick}
        isLoading={false}
      />
    );

    const firstReport = screen.getByText("Broken Street Light").closest("div");
    if (firstReport) {
      fireEvent.click(firstReport);
    }

    expect(mockOnReportClick).toHaveBeenCalledWith(mockReports[0]);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("should format category names correctly", () => {
    const reportWithUnderscores: Report[] = [
      {
        id: 3,
        title: "Test",
        description: "Test",
        category: "WASTE_MANAGEMENT",
        latitude: 45.0,
        longitude: 7.0,
        status: "PENDING",
        createdAt: new Date(),
        anonymous: false,
      },
    ];

    render(
      <ClusterReportsSheet
        reports={reportWithUnderscores}
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onReportClick={mockOnReportClick}
        isLoading={false}
      />
    );

    expect(screen.getByText("Category: WASTE MANAGEMENT")).toBeInTheDocument();
  });

  it("should display description when provided", () => {
    render(
      <ClusterReportsSheet
        reports={mockReports}
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onReportClick={mockOnReportClick}
        isLoading={false}
      />
    );

    expect(screen.getByText("Click on a report to view details.")).toBeInTheDocument();
  });

  it("should handle large number of reports", () => {
    const manyReports: Report[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      title: `Report ${i}`,
      description: `Description ${i}`,
      category: "OTHER",
      latitude: 45.0 + i * 0.001,
      longitude: 7.0 + i * 0.001,
      status: "PENDING",
      createdAt: new Date(),
      anonymous: false,
    }));

    render(
      <ClusterReportsSheet
        reports={manyReports}
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onReportClick={mockOnReportClick}
        isLoading={false}
      />
    );

    expect(screen.getByText("Reports in Cluster (50)")).toBeInTheDocument();
    expect(screen.getByText("Report 0")).toBeInTheDocument();
  });

  it("should close sheet when onOpenChange is called with false", () => {
    const { rerender } = render(
      <ClusterReportsSheet
        reports={mockReports}
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onReportClick={mockOnReportClick}
        isLoading={false}
      />
    );

    expect(screen.getByText("Broken Street Light")).toBeInTheDocument();

    rerender(
      <ClusterReportsSheet
        reports={mockReports}
        isOpen={false}
        onOpenChange={mockOnOpenChange}
        onReportClick={mockOnReportClick}
        isLoading={false}
      />
    );
  });
});
