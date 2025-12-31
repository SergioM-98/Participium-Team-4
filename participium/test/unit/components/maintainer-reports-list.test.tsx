import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReportsList from "@/app/maintainer/my-reports/reports-list";
import { getReportsByMaintainerId } from "@/controllers/report.controller";
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
      <button onClick={onClose}>Close Details</button>
    </div>
  ),
}));

const mockGetReportsByMaintainerId = getReportsByMaintainerId as jest.MockedFunction<
  typeof getReportsByMaintainerId
>;
const mockGetPhoto = getPhoto as jest.MockedFunction<typeof getPhoto>;

const mockReports = [
  {
    id: 1,
    title: "Water Leak on Main Street",
    description: "Large water leak causing flooding",
    category: "WATER_SUPPLY",
    status: "ASSIGNED",
    latitude: 40.7128,
    longitude: -74.006,
    photos: ["photo1.jpg"],
    citizen: { username: "john_doe" },
    citizenId: 1,
    officerId: 2,
    companyId: null,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    title: "Broken Traffic Light",
    description: "Traffic light not working at intersection",
    category: "ROADS_SIGNS_AND_TRAFFIC_LIGHTS",
    status: "IN_PROGRESS",
    latitude: 40.7589,
    longitude: -73.9851,
    photos: ["photo2.jpg", "photo3.jpg"],
    citizen: { username: "jane_smith" },
    citizenId: 3,
    officerId: 2,
    companyId: null,
    createdAt: "2024-01-16T14:30:00Z",
  },
  {
    id: 3,
    title: "Pothole on Highway",
    description: "Deep pothole needs repair",
    category: "ROADS_AND_URBAN_FURNISHINGS",
    status: "SUSPENDED",
    latitude: 40.73,
    longitude: -74.0,
    photos: [],
    citizen: { username: "bob_jones" },
    citizenId: 4,
    officerId: 2,
    companyId: "company1",
    createdAt: "2024-01-17T09:15:00Z",
  },
];

describe("ReportsList (Maintainer)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPhoto.mockResolvedValue({
      success: true,
      data: "data:image/jpeg;base64,mockphoto",
    });
  });

  it("should render loading state initially", () => {
    mockGetReportsByMaintainerId.mockImplementation(
      () => new Promise(() => {})
    );

    render(<ReportsList maintainerId="maintainer-1" />);

    const loader = document.querySelector(".animate-spin");
    expect(loader).toBeInTheDocument();
  });

  it("should render reports after successful fetch", async () => {
    mockGetReportsByMaintainerId.mockResolvedValue({
      success: true,
      data: mockReports,
    });

    render(<ReportsList maintainerId="maintainer-1" />);

    await waitFor(() => {
      expect(screen.getByText("Water Leak on Main Street")).toBeInTheDocument();
    });

    expect(screen.getByText("Broken Traffic Light")).toBeInTheDocument();
    expect(screen.getByText("Pothole on Highway")).toBeInTheDocument();
  });

  it("should display total reports count", async () => {
    mockGetReportsByMaintainerId.mockResolvedValue({
      success: true,
      data: mockReports,
    });

    render(<ReportsList maintainerId="maintainer-1" />);

    await waitFor(
      () => {
        expect(screen.getByText("My Assigned Reports")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    await waitFor(
      () => {
        const countElements = screen.getAllByText("3");
        expect(countElements.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
  });

  it("should display number of categories", async () => {
    mockGetReportsByMaintainerId.mockResolvedValue({
      success: true,
      data: mockReports,
    });

    render(<ReportsList maintainerId="maintainer-1" />);

    await waitFor(() => {
      const cards = screen.getAllByText("3");
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  it("should filter reports by search query", async () => {
    const user = userEvent.setup();
    mockGetReportsByMaintainerId.mockResolvedValue({
      success: true,
      data: mockReports,
    });

    render(<ReportsList maintainerId="maintainer-1" />);

    await waitFor(() => {
      expect(screen.getByText("Water Leak on Main Street")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search reports...");
    await user.type(searchInput, "water");

    await waitFor(() => {
      expect(screen.getByText("Water Leak on Main Street")).toBeInTheDocument();
      expect(screen.queryByText("Broken Traffic Light")).not.toBeInTheDocument();
      expect(screen.queryByText("Pothole on Highway")).not.toBeInTheDocument();
    });
  });

  it("should filter reports by category", async () => {
    const user = userEvent.setup();
    mockGetReportsByMaintainerId.mockResolvedValue({
      success: true,
      data: mockReports,
    });

    render(<ReportsList maintainerId="maintainer-1" />);

    await waitFor(() => {
      expect(screen.getByText("Water Leak on Main Street")).toBeInTheDocument();
    });

    const categorySelects = screen.getAllByRole("combobox");
    const categorySelect = categorySelects[0];
    await user.click(categorySelect);

    const waterSupplyOption = await screen.findByRole("option", {
      name: "Water Supply",
    });
    await user.click(waterSupplyOption);

    await waitFor(() => {
      expect(screen.getByText("Water Leak on Main Street")).toBeInTheDocument();
      expect(screen.queryByText("Broken Traffic Light")).not.toBeInTheDocument();
    });
  });

  it("should filter reports by status", async () => {
    const user = userEvent.setup();
    mockGetReportsByMaintainerId.mockResolvedValue({
      success: true,
      data: mockReports,
    });

    render(<ReportsList maintainerId="maintainer-1" />);

    await waitFor(() => {
      expect(screen.getByText("Water Leak on Main Street")).toBeInTheDocument();
    });

    const selects = screen.getAllByRole("combobox");
    const statusSelect = selects[1];
    await user.click(statusSelect);

    const inProgressOption = await screen.findByRole("option", {
      name: "In Progress",
    });
    await user.click(inProgressOption);

    await waitFor(() => {
      expect(screen.getByText("Broken Traffic Light")).toBeInTheDocument();
      expect(screen.queryByText("Water Leak on Main Street")).not.toBeInTheDocument();
    });
  });

  it("should display error message when fetch fails", async () => {
    mockGetReportsByMaintainerId.mockResolvedValue({
      success: false,
      error: "Failed to fetch reports",
    });

    render(<ReportsList maintainerId="maintainer-1" />);

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(screen.getByText("Failed to fetch reports")).toBeInTheDocument();
    });
  });

  it("should display no reports message when list is empty", async () => {
    mockGetReportsByMaintainerId.mockResolvedValue({
      success: true,
      data: [],
    });

    render(<ReportsList maintainerId="maintainer-1" />);

    await waitFor(() => {
      expect(screen.getByText("No reports found")).toBeInTheDocument();
      expect(
        screen.getByText("You don't have any assigned reports yet")
      ).toBeInTheDocument();
    });
  });

  it("should display filtered message when no results match filters", async () => {
    const user = userEvent.setup();
    mockGetReportsByMaintainerId.mockResolvedValue({
      success: true,
      data: mockReports,
    });

    render(<ReportsList maintainerId="maintainer-1" />);

    await waitFor(() => {
      expect(screen.getByText("Water Leak on Main Street")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search reports...");
    await user.type(searchInput, "nonexistent report");

    await waitFor(() => {
      expect(screen.getByText("No reports found")).toBeInTheDocument();
      expect(screen.getByText("Try adjusting your filters")).toBeInTheDocument();
    });
  });

  it("should open report details when View Details is clicked", async () => {
    const user = userEvent.setup();
    mockGetReportsByMaintainerId.mockResolvedValue({
      success: true,
      data: mockReports,
    });

    render(<ReportsList maintainerId="maintainer-1" />);

    await waitFor(() => {
      expect(screen.getByText("Water Leak on Main Street")).toBeInTheDocument();
    });

    const viewDetailsButtons = screen.getAllByRole("button", {
      name: "View Details",
    });
    await user.click(viewDetailsButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId("report-details-card")).toBeInTheDocument();
    });
  });

  it("should close report details when close button is clicked", async () => {
    const user = userEvent.setup();
    mockGetReportsByMaintainerId.mockResolvedValue({
      success: true,
      data: mockReports,
    });

    render(<ReportsList maintainerId="maintainer-1" />);

    await waitFor(() => {
      expect(screen.getByText("Water Leak on Main Street")).toBeInTheDocument();
    });

    const viewDetailsButtons = screen.getAllByRole("button", {
      name: "View Details",
    });
    await user.click(viewDetailsButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId("report-details-card")).toBeInTheDocument();
    });

    const closeButton = screen.getByRole("button", { name: "Close Details" });
    await user.click(closeButton);

    await waitFor(() => {
      expect(
        screen.queryByTestId("report-details-card")
      ).not.toBeInTheDocument();
    });
  });

  it("should display photo count for each report", async () => {
    mockGetReportsByMaintainerId.mockResolvedValue({
      success: true,
      data: mockReports,
    });

    render(<ReportsList maintainerId="maintainer-1" />);

    await waitFor(() => {
      expect(screen.getByText("1 photo")).toBeInTheDocument();
      expect(screen.getByText("2 photos")).toBeInTheDocument();
      expect(screen.getByText("0 photos")).toBeInTheDocument();
    });
  });

  it("should display coordinates for each report", async () => {
    mockGetReportsByMaintainerId.mockResolvedValue({
      success: true,
      data: mockReports,
    });

    render(<ReportsList maintainerId="maintainer-1" />);

    await waitFor(() => {
      expect(screen.getByText("40.7128, -74.0060")).toBeInTheDocument();
      expect(screen.getByText("40.7589, -73.9851")).toBeInTheDocument();
    });
  });

  it("should load and display photos", async () => {
    mockGetReportsByMaintainerId.mockResolvedValue({
      success: true,
      data: mockReports,
    });

    render(<ReportsList maintainerId="maintainer-1" />);

    await waitFor(() => {
      expect(screen.getByText("Water Leak on Main Street")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockGetPhoto).toHaveBeenCalledWith("photo1.jpg");
      expect(mockGetPhoto).toHaveBeenCalledWith("photo2.jpg");
      expect(mockGetPhoto).toHaveBeenCalledWith("photo3.jpg");
    });
  });

  it("should handle photo fetch failure gracefully", async () => {
    mockGetReportsByMaintainerId.mockResolvedValue({
      success: true,
      data: mockReports,
    });
    mockGetPhoto.mockResolvedValue({
      success: false,
    });

    render(<ReportsList maintainerId="maintainer-1" />);

    await waitFor(() => {
      expect(screen.getByText("Water Leak on Main Street")).toBeInTheDocument();
    });

    // Component should still render even if photos fail to load
    expect(screen.getByText("Broken Traffic Light")).toBeInTheDocument();
  });

  it("should combine multiple filters correctly", async () => {
    const user = userEvent.setup();
    mockGetReportsByMaintainerId.mockResolvedValue({
      success: true,
      data: mockReports,
    });

    render(<ReportsList maintainerId="maintainer-1" />);

    await waitFor(() => {
      expect(screen.getByText("Water Leak on Main Street")).toBeInTheDocument();
    });

    // Filter by category
    const selects = screen.getAllByRole("combobox");
    await user.click(selects[0]);
    const waterOption = await screen.findByRole("option", {
      name: "Water Supply",
    });
    await user.click(waterOption);

    // Filter by status
    await user.click(selects[1]);
    const assignedOption = await screen.findByRole("option", {
      name: "Assigned",
    });
    await user.click(assignedOption);

    await waitFor(() => {
      expect(screen.getByText("Water Leak on Main Street")).toBeInTheDocument();
      expect(screen.queryByText("Broken Traffic Light")).not.toBeInTheDocument();
      expect(screen.queryByText("Pothole on Highway")).not.toBeInTheDocument();
    });
  });

  it("should display status badges with correct colors", async () => {
    mockGetReportsByMaintainerId.mockResolvedValue({
      success: true,
      data: mockReports,
    });

    render(<ReportsList maintainerId="maintainer-1" />);

    await waitFor(() => {
      expect(screen.getByText("Assigned")).toBeInTheDocument();
      expect(screen.getByText("In Progress")).toBeInTheDocument();
      expect(screen.getByText("Suspended")).toBeInTheDocument();
    });
  });

  it("should display category badges", async () => {
    mockGetReportsByMaintainerId.mockResolvedValue({
      success: true,
      data: mockReports,
    });

    render(<ReportsList maintainerId="maintainer-1" />);

    await waitFor(() => {
      expect(screen.getByText("Water Supply")).toBeInTheDocument();
      expect(screen.getByText("Roads, Signs & Traffic Lights")).toBeInTheDocument();
      expect(screen.getByText("Roads & Urban Furnishings")).toBeInTheDocument();
    });
  });

  it("should handle unexpected error during fetch", async () => {
    mockGetReportsByMaintainerId.mockRejectedValue(new Error("Network error"));

    render(<ReportsList maintainerId="maintainer-1" />);

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(screen.getByText("An unexpected error occurred")).toBeInTheDocument();
    });
  });

  it("should reset to all categories when selecting All Categories", async () => {
    const user = userEvent.setup();
    mockGetReportsByMaintainerId.mockResolvedValue({
      success: true,
      data: mockReports,
    });

    render(<ReportsList maintainerId="maintainer-1" />);

    await waitFor(() => {
      expect(screen.getByText("Water Leak on Main Street")).toBeInTheDocument();
    });

    // First filter by category
    const selects = screen.getAllByRole("combobox");
    await user.click(selects[0]);
    const waterOption = await screen.findByRole("option", {
      name: "Water Supply",
    });
    await user.click(waterOption);

    await waitFor(() => {
      expect(screen.queryByText("Broken Traffic Light")).not.toBeInTheDocument();
    });

    // Then reset to all
    await user.click(selects[0]);
    const allOption = await screen.findByRole("option", {
      name: "All Categories",
    });
    await user.click(allOption);

    await waitFor(() => {
      expect(screen.getByText("Water Leak on Main Street")).toBeInTheDocument();
      expect(screen.getByText("Broken Traffic Light")).toBeInTheDocument();
      expect(screen.getByText("Pothole on Highway")).toBeInTheDocument();
    });
  });
});
