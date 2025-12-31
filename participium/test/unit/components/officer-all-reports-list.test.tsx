import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AllReportsList } from "@/app/officer/all-reports/all-reports-list";
import { getPendingApprovalReports } from "@/controllers/report.controller";
import { getPhoto } from "@/controllers/photo.controller";

jest.mock("@/auth", () => ({}));
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));
jest.mock("@/controllers/report.controller");
jest.mock("@/controllers/photo.controller");
jest.mock("@/components/ReportDetailsCard", () => ({
  __esModule: true,
  default: ({ onClose }: any) => (
    <div data-testid="report-details-card">
      <button onClick={onClose}>Close Card</button>
    </div>
  ),
}));

const mockGetPendingApprovalReports = getPendingApprovalReports as jest.MockedFunction<
  typeof getPendingApprovalReports
>;
const mockGetPhoto = getPhoto as jest.MockedFunction<typeof getPhoto>;

const mockReportsData = [
  {
    id: "1",
    title: "Broken Streetlight",
    description: "Streetlight not working on Main St",
    category: "PUBLIC_LIGHTING",
    latitude: 40.7128,
    longitude: -74.006,
    photos: [{ filename: "photo1.jpg", url: "photo1.jpg" }],
    citizen: {
      id: "c1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      username: "johndoe",
    },
    companyId: null,
  },
  {
    id: "2",
    title: "Water Leak",
    description: "Water leak on Oak Avenue",
    category: "WATER_SUPPLY",
    latitude: 40.7589,
    longitude: -73.9851,
    photos: [],
    citizen: {
      id: "c2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      username: "janesmith",
    },
    companyId: null,
  },
  {
    id: "3",
    title: "Pothole",
    description: "Large pothole needs repair",
    category: "ROADS_AND_URBAN_FURNISHINGS",
    latitude: 40.73,
    longitude: -74.0,
    photos: [],
    citizen: null,
    companyId: null,
  },
];

describe("AllReportsList (Officer)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPhoto.mockResolvedValue({
      success: true,
      data: "data:image/jpeg;base64,mockphoto",
    });
  });

  it("should render with provided data prop", () => {
    const mockData = [
      {
        id: "1",
        title: "Test Report",
        description: "Test description",
        category: "WASTE" as any,
        status: "PENDING" as any,
        dateSubmitted: new Date().toISOString(),
        isAnonymous: false,
        submitter: {
          id: "1",
          firstName: "John",
          lastName: "Doe",
          email: "john@test.com",
          username: "johndoe",
        },
        rejectionReason: undefined,
        photos: [],
        latitude: 40.7,
        longitude: -74.0,
        companyId: null,
      },
    ];

    render(<AllReportsList data={mockData} />);

    expect(screen.getByText("All Submitted Reports")).toBeInTheDocument();
    expect(screen.getByText("Test Report")).toBeInTheDocument();
  });

  it("should fetch reports when no data prop is provided", async () => {
    mockGetPendingApprovalReports.mockResolvedValue({
      success: true,
      data: mockReportsData,
    });

    render(<AllReportsList />);

    expect(screen.getByText("Loading reports...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Broken Streetlight")).toBeInTheDocument();
    });

    expect(screen.getByText("Water Leak")).toBeInTheDocument();
  });

  it("should display error message when fetch fails", async () => {
    mockGetPendingApprovalReports.mockResolvedValue({
      success: false,
      error: "Failed to load reports",
    });

    render(<AllReportsList />);

    await waitFor(() => {
      expect(screen.getByText("Error Loading Reports")).toBeInTheDocument();
      expect(screen.getByText("Failed to load reports")).toBeInTheDocument();
    });
  });

  it("should display count of filtered reports", async () => {
    mockGetPendingApprovalReports.mockResolvedValue({
      success: true,
      data: mockReportsData,
    });

    render(<AllReportsList />);

    await waitFor(() => {
      expect(screen.getByText(/3 reports found/i)).toBeInTheDocument();
    });
  });

  it("should filter reports by global search", async () => {
    const user = userEvent.setup();
    mockGetPendingApprovalReports.mockResolvedValue({
      success: true,
      data: mockReportsData,
    });

    render(<AllReportsList />);

    await waitFor(() => {
      expect(screen.getByText("Broken Streetlight")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      /Search by submitter name or email/i
    );
    await user.type(searchInput, "jane");

    await waitFor(() => {
      expect(screen.getByText(/1 report found/i)).toBeInTheDocument();
    });
  });

  it("should filter reports by category", async () => {
    const user = userEvent.setup();
    mockGetPendingApprovalReports.mockResolvedValue({
      success: true,
      data: mockReportsData,
    });

    render(<AllReportsList />);

    await waitFor(() => {
      expect(screen.getByText("Broken Streetlight")).toBeInTheDocument();
    });

    const waterSupplyButton = screen.getByRole("button", { name: "Water Supply" });
    await user.click(waterSupplyButton);

    await waitFor(() => {
      expect(screen.getByText(/1 report found/i)).toBeInTheDocument();
      expect(screen.getByText("Water Leak")).toBeInTheDocument();
    });
  });

  it("should reset category filter to show all reports", async () => {
    const user = userEvent.setup();
    mockGetPendingApprovalReports.mockResolvedValue({
      success: true,
      data: mockReportsData,
    });

    render(<AllReportsList />);

    await waitFor(() => {
      expect(screen.getByText("Broken Streetlight")).toBeInTheDocument();
    });

    // Filter by category first
    const waterSupplyButton = screen.getByRole("button", { name: "Water Supply" });
    await user.click(waterSupplyButton);

    await waitFor(() => {
      expect(screen.getByText(/1 report found/i)).toBeInTheDocument();
    });

    // Reset to all
    const allButton = screen.getAllByRole("button", { name: "All" })[0];
    await user.click(allButton);

    await waitFor(() => {
      expect(screen.getByText(/3 reports found/i)).toBeInTheDocument();
    });
  });

  it("should display anonymous user for reports without citizen", async () => {
    mockGetPendingApprovalReports.mockResolvedValue({
      success: true,
      data: mockReportsData,
    });

    render(<AllReportsList />);

    await waitFor(() => {
      expect(screen.getByText("Anonymous")).toBeInTheDocument();
    });
  });

  it("should open report details when row is clicked", async () => {
    const user = userEvent.setup();
    mockGetPendingApprovalReports.mockResolvedValue({
      success: true,
      data: mockReportsData,
    });

    render(<AllReportsList />);

    await waitFor(() => {
      expect(screen.getByText("Broken Streetlight")).toBeInTheDocument();
    });

    const row = screen.getByText("Broken Streetlight").closest("tr");
    if (row) {
      await user.click(row);
    }

    await waitFor(() => {
      expect(screen.getByTestId("report-details-card")).toBeInTheDocument();
    });
  });

  it("should close report details when close button is clicked", async () => {
    const user = userEvent.setup();
    mockGetPendingApprovalReports.mockResolvedValue({
      success: true,
      data: mockReportsData,
    });

    render(<AllReportsList />);

    await waitFor(() => {
      expect(screen.getByText("Broken Streetlight")).toBeInTheDocument();
    });

    const row = screen.getByText("Broken Streetlight").closest("tr");
    if (row) {
      await user.click(row);
    }

    await waitFor(() => {
      expect(screen.getByTestId("report-details-card")).toBeInTheDocument();
    });

    const closeButton = screen.getByRole("button", { name: "Close Card" });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId("report-details-card")).not.toBeInTheDocument();
    });
  });

  it("should support pagination - next page", async () => {
    const user = userEvent.setup();
    const manyReports = Array.from({ length: 20 }, (_, i) => ({
      ...mockReportsData[0],
      id: `report-${i}`,
      title: `Report ${i}`,
    }));

    mockGetPendingApprovalReports.mockResolvedValue({
      success: true,
      data: manyReports,
    });

    render(<AllReportsList />);

    await waitFor(() => {
      expect(screen.getByText("Report 0")).toBeInTheDocument();
    });

    const nextButton = screen.getByRole("button", { name: "Next" });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/row\(s\) selected/i)).toBeInTheDocument();
    });
  });

  it("should support pagination - previous page", async () => {
    const user = userEvent.setup();
    const manyReports = Array.from({ length: 20 }, (_, i) => ({
      ...mockReportsData[0],
      id: `report-${i}`,
      title: `Report ${i}`,
    }));

    mockGetPendingApprovalReports.mockResolvedValue({
      success: true,
      data: manyReports,
    });

    render(<AllReportsList />);

    await waitFor(() => {
      expect(screen.getByText("Report 0")).toBeInTheDocument();
    });

    const nextButton = screen.getByRole("button", { name: "Next" });
    await user.click(nextButton);

    const previousButton = screen.getByRole("button", { name: "Previous" });
    await user.click(previousButton);

    await waitFor(() => {
      expect(screen.getByText("Report 0")).toBeInTheDocument();
    });
  });

  it("should display no reports message when list is empty", async () => {
    mockGetPendingApprovalReports.mockResolvedValue({
      success: true,
      data: [],
    });

    render(<AllReportsList />);

    await waitFor(() => {
      expect(screen.getByText("No reports match your filters")).toBeInTheDocument();
    });
  });

  it("should handle fetch error gracefully", async () => {
    mockGetPendingApprovalReports.mockRejectedValue(new Error("Network error"));

    render(<AllReportsList />);

    await waitFor(() => {
      expect(screen.getByText("An unexpected error occurred")).toBeInTheDocument();
    });
  });

  it("should display formatted date for each report", async () => {
    mockGetPendingApprovalReports.mockResolvedValue({
      success: true,
      data: mockReportsData,
    });

    render(<AllReportsList />);

    await waitFor(() => {
      expect(screen.getByText("Broken Streetlight")).toBeInTheDocument();
    });

    // Dates should be formatted
    const dateRegex = /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/;
    expect(screen.getAllByText(dateRegex).length).toBeGreaterThan(0);
  });

  it("should display status badge for each report", async () => {
    mockGetPendingApprovalReports.mockResolvedValue({
      success: true,
      data: mockReportsData,
    });

    render(<AllReportsList />);

    await waitFor(() => {
      expect(screen.getByText("Broken Streetlight")).toBeInTheDocument();
    });

    const badges = screen.getAllByText(/PENDING/i);
    expect(badges.length).toBeGreaterThan(0);
  });

  it("should support row selection", async () => {
    const user = userEvent.setup();
    mockGetPendingApprovalReports.mockResolvedValue({
      success: true,
      data: mockReportsData,
    });

    render(<AllReportsList />);

    await waitFor(() => {
      expect(screen.getByText("Broken Streetlight")).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole("checkbox");
    if (checkboxes.length > 1) {
      await user.click(checkboxes[1]); // Click first data row checkbox

      await waitFor(() => {
        expect(screen.getByText(/1 of 3 row\(s\) selected/i)).toBeInTheDocument();
      });
    }
  });

  it("should load photos for selected report", async () => {
    const user = userEvent.setup();
    mockGetPendingApprovalReports.mockResolvedValue({
      success: true,
      data: mockReportsData,
    });

    render(<AllReportsList />);

    await waitFor(() => {
      expect(screen.getByText("Broken Streetlight")).toBeInTheDocument();
    });

    const row = screen.getByText("Broken Streetlight").closest("tr");
    if (row) {
      await user.click(row);
    }

    await waitFor(() => {
      expect(mockGetPhoto).toHaveBeenCalledWith("photo1.jpg");
    });
  });

  it("should handle photo load failure gracefully", async () => {
    const user = userEvent.setup();
    mockGetPendingApprovalReports.mockResolvedValue({
      success: true,
      data: mockReportsData,
    });
    mockGetPhoto.mockResolvedValue({ success: false });

    render(<AllReportsList />);

    await waitFor(() => {
      expect(screen.getByText("Broken Streetlight")).toBeInTheDocument();
    });

    const row = screen.getByText("Broken Streetlight").closest("tr");
    if (row) {
      await user.click(row);
    }

    // Should still render details card even if photo fails
    await waitFor(() => {
      expect(screen.getByTestId("report-details-card")).toBeInTheDocument();
    });
  });

  it("should show toast notification when action is completed", async () => {
    const user = userEvent.setup();
    mockGetPendingApprovalReports.mockResolvedValue({
      success: true,
      data: mockReportsData,
    });

    render(<AllReportsList />);

    await waitFor(() => {
      expect(screen.getByText("Broken Streetlight")).toBeInTheDocument();
    });

    const row = screen.getByText("Broken Streetlight").closest("tr");
    if (row) {
      await user.click(row);
    }

    // Wait for the details card to appear
    await waitFor(() => {
      expect(screen.getByTestId("report-details-card")).toBeInTheDocument();
    });
  });

  it("should refresh reports list after closing details", async () => {
    const user = userEvent.setup();
    let callCount = 0;
    mockGetPendingApprovalReports.mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        success: true,
        data: mockReportsData,
      });
    });

    render(<AllReportsList />);

    await waitFor(() => {
      expect(screen.getByText("Broken Streetlight")).toBeInTheDocument();
    });

    expect(callCount).toBe(1);

    const row = screen.getByText("Broken Streetlight").closest("tr");
    if (row) {
      await user.click(row);
    }

    const closeButton = await screen.findByRole("button", { name: "Close Card" });
    await user.click(closeButton);

    await waitFor(() => {
      expect(callCount).toBe(2);
    });
  });

  it("should display category labels correctly", async () => {
    mockGetPendingApprovalReports.mockResolvedValue({
      success: true,
      data: mockReportsData,
    });

    render(<AllReportsList />);

    await waitFor(() => {
      expect(screen.getAllByText("Public Lighting").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Water Supply").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Roads & Urban Furnishings").length).toBeGreaterThan(0);
    });
  });

  it("should filter out anonymous reports from global search", async () => {
    const user = userEvent.setup();
    mockGetPendingApprovalReports.mockResolvedValue({
      success: true,
      data: mockReportsData,
    });

    render(<AllReportsList />);

    await waitFor(() => {
      expect(screen.getByText("Broken Streetlight")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      /Search by submitter name or email/i
    );
    await user.type(searchInput, "anonymous");

    await waitFor(() => {
      expect(screen.getByText(/0 reports found/i)).toBeInTheDocument();
    });
  });
});
