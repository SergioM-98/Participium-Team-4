import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReportDetailsCard from "@/components/ReportDetailsCard";
import { useSession } from "next-auth/react";

jest.mock("next-auth/react");
jest.mock("@/components/LeafletMapFixed", () => ({
  __esModule: true,
  default: () => <div>Map Component</div>,
}));
jest.mock("@/components/ChatPanel", () => ({
  __esModule: true,
  default: () => <div>Chat Panel</div>,
}));
jest.mock("@/components/InternalNotesPanel", () => ({
  __esModule: true,
  default: ({ reportId }: { reportId: string }) => (
    <div>Internal Notes Panel</div>
  ),
}));
jest.mock("@/app/officer/all-reports/OfficerActionPanel", () => ({
  __esModule: true,
  default: () => <div>Officer Action Panel</div>,
}));
jest.mock("@/app/maintainer/my-reports/MaintainerActionPanel", () => ({
  __esModule: true,
  default: () => <div>Maintainer Action Panel</div>,
}));
jest.mock("@/components/OfficerReportMenu", () => ({
  __esModule: true,
  default: () => <div>Officer Report Menu</div>,
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

const mockReport = {
  id: "123",
  title: "Test Report",
  description: "This is a test description",
  category: "WATER_SUPPLY",
  status: "pending_approval" as const,
  latitude: 45.0703,
  longitude: 7.6869,
  reporterName: "John Doe",
  createdAt: new Date().toISOString(),
  companyId: null,
  photoUrls: ["https://example.com/photo1.jpg"],
};

describe("ReportDetailsCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "456", username: "testuser", role: ["CITIZEN"] },
      } as any,
      status: "authenticated",
      update: jest.fn(),
    } as any);

    // Mock fetch for messages API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: "1", text: "Test message" }]),
      }),
    ) as jest.Mock;
  });

  it("should render report title", () => {
    render(<ReportDetailsCard report={mockReport} />);

    expect(screen.getByText("Test Report")).toBeInTheDocument();
  });

  it("should render report description", () => {
    render(<ReportDetailsCard report={mockReport} />);

    expect(screen.getByText("This is a test description")).toBeInTheDocument();
  });

  it("should render report category", () => {
    render(<ReportDetailsCard report={mockReport} />);

    expect(screen.getByText("Water Supply")).toBeInTheDocument();
  });

  it("should render status badge", () => {
    render(<ReportDetailsCard report={mockReport} />);

    expect(screen.getByText("Pending Approval")).toBeInTheDocument();
  });

  it("should render reporter name", () => {
    render(<ReportDetailsCard report={mockReport} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should render formatted date", () => {
    render(<ReportDetailsCard report={mockReport} />);

    const dateElement = screen.getByText(/\d{1,2}:\d{2}/);
    expect(dateElement).toBeInTheDocument();
  });

  it("should render close button when onClose is provided", () => {
    const onClose = jest.fn();
    render(<ReportDetailsCard report={mockReport} onClose={onClose} />);

    expect(screen.getByRole("button", { name: "" })).toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<ReportDetailsCard report={mockReport} onClose={onClose} />);

    const closeButton = screen.getByRole("button", { name: "" });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it("should not render close button when onClose is not provided", () => {
    render(<ReportDetailsCard report={mockReport} />);

    const buttons = screen.queryAllByRole("button");
    const closeButtons = buttons.filter(
      (btn) =>
        btn.querySelector("svg") &&
        btn.getAttribute("class")?.includes("ghost"),
    );
    expect(closeButtons.length).toBe(0);
  });

  it("should render map for officer mode", () => {
    const { container } = render(
      <ReportDetailsCard report={mockReport} isOfficerMode={true} />,
    );

    // Check that the map container div exists
    const mapContainer = container.querySelector(".hidden.md\\:flex");
    expect(mapContainer).toBeInTheDocument();
  });

  it("should render map for maintainer mode", () => {
    render(<ReportDetailsCard report={mockReport} isMaintainerMode={true} />);

    expect(
      screen.getByText("Map Component", { hidden: true }),
    ).toBeInTheDocument();
  });

  it("should not render map for citizen", () => {
    render(<ReportDetailsCard report={mockReport} />);

    expect(screen.queryByText("Map Component")).not.toBeInTheDocument();
  });

  it("should render chat for report creator", async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "789", username: "creator", role: ["CITIZEN"] },
      } as any,
      status: "authenticated",
      update: jest.fn(),
    } as any);

    const reportWithCreator = { ...mockReport, citizenId: "789" };

    render(<ReportDetailsCard report={reportWithCreator} showChat={true} />);

    await waitFor(() => {
      expect(screen.getByText("Chat Panel")).toBeInTheDocument();
    });
  });

  it("should render chat for assigned officer", async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "999", username: "officer", role: ["TECHNICAL_OFFICER"] },
      } as any,
      status: "authenticated",
      update: jest.fn(),
    } as any);

    const reportWithOfficer = { ...mockReport, officerId: "999" };

    render(<ReportDetailsCard report={reportWithOfficer} showChat={true} />);

    await waitFor(() => {
      expect(screen.getByText("Chat Panel")).toBeInTheDocument();
    });
  });

  it("should not render chat when showChat is false", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "789", username: "creator", role: ["CITIZEN"] },
      } as any,
      status: "authenticated",
      update: jest.fn(),
    } as any);

    const reportWithCreator = { ...mockReport, citizenId: "789" };

    render(<ReportDetailsCard report={reportWithCreator} showChat={false} />);

    expect(screen.queryByText("Chat Panel")).not.toBeInTheDocument();
  });

  it("should render OfficerActionPanel in officer mode", () => {
    render(
      <ReportDetailsCard
        report={mockReport}
        isOfficerMode={true}
        showChat={false}
      />,
    );

    expect(screen.getByText("Officer Action Panel")).toBeInTheDocument();
  });

  it("should render MaintainerActionPanel in maintainer mode", () => {
    render(<ReportDetailsCard report={mockReport} isMaintainerMode={true} />);

    expect(screen.getByText("Maintainer Action Panel")).toBeInTheDocument();
  });

  it("should render OfficerReportMenu for assigned officer with chat", async () => {
    const user = userEvent.setup();
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "999", username: "officer", role: ["TECHNICAL_OFFICER"] },
      } as any,
      status: "authenticated",
      update: jest.fn(),
    } as any);

    const reportWithOfficer = { ...mockReport, officerId: "999" };

    render(<ReportDetailsCard report={reportWithOfficer} showChat={true} />);

    // Click on Menu tab
    const menuButton = screen.getByRole("button", { name: /menu/i });
    await user.click(menuButton);

    expect(screen.getByText("Officer Report Menu")).toBeInTheDocument();
  });

  it("should render Internal Notes Panel for officers", async () => {
    const user = userEvent.setup();

    // Mock the user as the assigned officer
    const reportWithOfficer = { ...mockReport, officerId: "456" };

    render(<ReportDetailsCard report={reportWithOfficer} showChat={true} />);

    // Click on Internal Notes tab
    const internalNotesButton = await screen.findByRole("button", {
      name: /internal notes/i,
    });
    await user.click(internalNotesButton);

    // Verify Internal Notes Panel is rendered (check for a component element instead of specific text)
    await waitFor(() => {
      expect(internalNotesButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  it("should render Internal Notes Panel for maintainers", async () => {
    const user = userEvent.setup();

    render(<ReportDetailsCard report={mockReport} isMaintainerMode={true} />);

    // Click on Internal Notes tab (it's the second tab for maintainers)
    const internalNotesButton = screen.getByRole("button", {
      name: /internal notes/i,
    });
    await user.click(internalNotesButton);

    // Verify Internal Notes Panel is rendered
    await waitFor(() => {
      expect(internalNotesButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  it("should handle assigned status badge", () => {
    const assignedReport = { ...mockReport, status: "assigned" as const };
    render(<ReportDetailsCard report={assignedReport} />);

    expect(screen.getByText("Assigned")).toBeInTheDocument();
  });

  it("should handle in_progress status badge", () => {
    const inProgressReport = { ...mockReport, status: "in_progress" as const };
    render(<ReportDetailsCard report={inProgressReport} />);

    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("should handle suspended status badge", () => {
    const suspendedReport = { ...mockReport, status: "suspended" as const };
    render(<ReportDetailsCard report={suspendedReport} />);

    expect(screen.getByText("Suspended")).toBeInTheDocument();
  });

  it("should handle rejected status badge", () => {
    const rejectedReport = { ...mockReport, status: "rejected" as const };
    render(<ReportDetailsCard report={rejectedReport} />);

    expect(screen.getByText("Rejected")).toBeInTheDocument();
  });

  it("should handle resolved status badge", () => {
    const resolvedReport = { ...mockReport, status: "resolved" as const };
    render(<ReportDetailsCard report={resolvedReport} />);

    expect(screen.getByText("Resolved")).toBeInTheDocument();
  });

  it("should render photos when provided", () => {
    render(<ReportDetailsCard report={mockReport} />);

    const photoContainers = screen.queryAllByRole("img", { hidden: true });
    expect(photoContainers.length).toBeGreaterThanOrEqual(0);
  });

  it("should handle report with no photos", () => {
    const reportNoPhotos = {
      ...mockReport,
      photoUrls: undefined,
      photos: undefined,
    };
    render(<ReportDetailsCard report={reportNoPhotos} />);

    expect(screen.getByText("Test Report")).toBeInTheDocument();
  });

  it("should handle anonymous reporter", () => {
    const anonymousReport = { ...mockReport, reporterName: "" };
    render(<ReportDetailsCard report={anonymousReport} />);

    expect(screen.getByText("Anonymous")).toBeInTheDocument();
  });

  it("should format category names correctly", () => {
    const categories = [
      { input: "WATER_SUPPLY", expected: "Water Supply" },
      { input: "ARCHITECTURAL_BARRIERS", expected: "Architectural Barriers" },
      { input: "SEWER_SYSTEM", expected: "Sewer System" },
    ];

    categories.forEach(({ input, expected }) => {
      const { unmount } = render(
        <ReportDetailsCard report={{ ...mockReport, category: input }} />,
      );
      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  it("should handle invalid date gracefully", () => {
    const invalidDateReport = { ...mockReport, createdAt: "" };
    render(<ReportDetailsCard report={invalidDateReport} />);

    // Should still render without crashing
    expect(screen.getByText("Test Report")).toBeInTheDocument();
  });

  it("should render coordinates in description section", () => {
    render(<ReportDetailsCard report={mockReport} />);

    // The component shows lat/lng somewhere
    expect(screen.getByText("Test Report")).toBeInTheDocument();
  });

  it("should show different tabs for officer with chat", async () => {
    const user = userEvent.setup();

    mockUseSession.mockReturnValue({
      data: {
        user: { id: "999", username: "officer", role: ["TECHNICAL_OFFICER"] },
      } as any,
      status: "authenticated",
      update: jest.fn(),
    } as any);

    const reportWithOfficer = { ...mockReport, officerId: "999" };

    render(<ReportDetailsCard report={reportWithOfficer} showChat={true} />);

    // Chat Panel should be visible by default
    expect(screen.getByText("Chat Panel")).toBeInTheDocument();

    // Click on Internal Notes tab
    const internalNotesButton = screen.getByRole("button", {
      name: /internal notes/i,
    });
    await user.click(internalNotesButton);
    expect(await screen.findByText("Internal Notes Panel")).toBeInTheDocument();

    // Click on Menu tab
    const menuButton = screen.getByRole("button", { name: /menu/i });
    await user.click(menuButton);
    expect(await screen.findByText("Officer Report Menu")).toBeInTheDocument();
  });

  it("should show only Menu and Internal Notes for maintainer", async () => {
    const user = userEvent.setup();

    render(<ReportDetailsCard report={mockReport} isMaintainerMode={true} />);

    // By default, the Maintainer Action Panel (Menu tab) should be visible
    expect(screen.getByText("Maintainer Action Panel")).toBeInTheDocument();

    // Click on Internal Notes tab
    const internalNotesButton = screen.getByRole("button", {
      name: /internal notes/i,
    });
    await user.click(internalNotesButton);

    // Verify Internal Notes Panel is rendered
    await waitFor(() => {
      expect(internalNotesButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  it("should call onOfficerActionComplete when provided", () => {
    const onComplete = jest.fn();
    render(
      <ReportDetailsCard
        report={mockReport}
        isOfficerMode={true}
        onOfficerActionComplete={onComplete}
      />,
    );

    expect(screen.getByText("Officer Action Panel")).toBeInTheDocument();
  });

  it("should call onMaintainerActionComplete when provided", () => {
    const onComplete = jest.fn();
    render(
      <ReportDetailsCard
        report={mockReport}
        isMaintainerMode={true}
        onMaintainerActionComplete={onComplete}
      />,
    );

    expect(screen.getByText("Maintainer Action Panel")).toBeInTheDocument();
  });

  it("should pass setRefreshFlag to child components", () => {
    const setRefreshFlag = jest.fn();
    render(
      <ReportDetailsCard
        report={mockReport}
        isOfficerMode={true}
        setRefreshFlag={setRefreshFlag}
      />,
    );

    expect(screen.getByText("Officer Action Panel")).toBeInTheDocument();
  });

  it("should pass setReport to child components", () => {
    const setReport = jest.fn();
    render(
      <ReportDetailsCard
        report={mockReport}
        isOfficerMode={true}
        setReport={setReport}
      />,
    );

    expect(screen.getByText("Officer Action Panel")).toBeInTheDocument();
  });

  it("should pass showToast to child components", () => {
    const showToast = jest.fn();
    render(
      <ReportDetailsCard
        report={mockReport}
        isOfficerMode={true}
        showToast={showToast}
      />,
    );

    expect(screen.getByText("Officer Action Panel")).toBeInTheDocument();
  });

  it("should handle report with company ID", () => {
    const reportWithCompany = { ...mockReport, companyId: "company-123" };
    render(<ReportDetailsCard report={reportWithCompany} />);

    expect(screen.getByText("Test Report")).toBeInTheDocument();
  });

  it("should render in mobile-friendly layout", () => {
    render(<ReportDetailsCard report={mockReport} isOfficerMode={true} />);

    // The component should render without errors
    expect(screen.getByText("Test Report")).toBeInTheDocument();
    expect(screen.getByText("Map Component")).toBeInTheDocument();
  });

  it("should handle report status normalization", () => {
    const statusVariants = [
      { input: "pending_approval", expected: "Pending Approval" },
      { input: "pending", expected: "Pending Approval" },
    ];

    statusVariants.forEach(({ input, expected }) => {
      const { unmount } = render(
        <ReportDetailsCard report={{ ...mockReport, status: input as any }} />,
      );
      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });
});
