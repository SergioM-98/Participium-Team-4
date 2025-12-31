import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MaintainerActionPanel from "@/app/maintainer/my-reports/MaintainerActionPanel";
import { updateReportStatus } from "@/controllers/report.controller";
jest.mock("@/auth", () => ({}));
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));jest.mock("@/controllers/report.controller");

const mockUpdateReportStatus = updateReportStatus as jest.MockedFunction<
  typeof updateReportStatus
>;

describe("MaintainerActionPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the panel with current status", () => {
    render(
      <MaintainerActionPanel
        reportId="1"
        currentStatus="ASSIGNED"
        onActionComplete={() => {}}
      />
    );

    expect(screen.getByText("Update Report Status")).toBeInTheDocument();
    expect(screen.getByText("Assigned")).toBeInTheDocument();
  });

  it("should display all allowed status options in the select", async () => {
    const user = userEvent.setup();
    render(
      <MaintainerActionPanel
        reportId="1"
        currentStatus="ASSIGNED"
        onActionComplete={() => {}}
      />
    );

    const selectTrigger = screen.getByRole("combobox");
    await user.click(selectTrigger);

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "In Progress" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Suspended" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Resolved" })).toBeInTheDocument();
    });
  });

  it("should have Update Status button disabled when no change is made", () => {
    render(
      <MaintainerActionPanel
        reportId="1"
        currentStatus="ASSIGNED"
        onActionComplete={() => {}}
      />
    );

    const button = screen.getByRole("button", { name: /Update Status/i });
    expect(button).toBeDisabled();
  });

  it("should enable Update Status button when a different status is selected", async () => {
    const user = userEvent.setup();
    render(
      <MaintainerActionPanel
        reportId="1"
        currentStatus="ASSIGNED"
        onActionComplete={() => {}}
      />
    );

    const selectTrigger = screen.getByRole("combobox");
    await user.click(selectTrigger);

    const inProgressOption = await screen.findByRole("option", {
      name: "In Progress",
    });
    await user.click(inProgressOption);

    const button = screen.getByRole("button", { name: /Update Status/i });
    expect(button).toBeEnabled();
  });

  it("should call updateReportStatus and show success message on successful update", async () => {
    const user = userEvent.setup();
    const mockOnActionComplete = jest.fn();
    mockUpdateReportStatus.mockResolvedValue({
      success: true,
      data: {},
    });

    render(
      <MaintainerActionPanel
        reportId="123"
        currentStatus="ASSIGNED"
        onActionComplete={mockOnActionComplete}
      />
    );

    const selectTrigger = screen.getByRole("combobox");
    await user.click(selectTrigger);

    const resolvedOption = await screen.findByRole("option", {
      name: "Resolved",
    });
    await user.click(resolvedOption);

    const button = screen.getByRole("button", { name: /Update Status/i });
    await user.click(button);

    await waitFor(() => {
      expect(mockUpdateReportStatus).toHaveBeenCalledWith("RESOLVED", "123");
    });

    await waitFor(() => {
      expect(screen.getByText("Status updated successfully")).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(mockOnActionComplete).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );
  });

  it("should show error message on failed update", async () => {
    const user = userEvent.setup();
    mockUpdateReportStatus.mockResolvedValue({
      success: false,
      error: "Failed to update status",
    });

    render(
      <MaintainerActionPanel
        reportId="456"
        currentStatus="IN_PROGRESS"
        onActionComplete={() => {}}
      />
    );

    const selectTrigger = screen.getByRole("combobox");
    await user.click(selectTrigger);

    const suspendedOption = await screen.findByRole("option", {
      name: "Suspended",
    });
    await user.click(suspendedOption);

    const button = screen.getByRole("button", { name: /Update Status/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("Failed to update status")).toBeInTheDocument();
    });
  });

  it("should show generic error message when updateReportStatus throws", async () => {
    const user = userEvent.setup();
    mockUpdateReportStatus.mockRejectedValue(new Error("Network error"));

    render(
      <MaintainerActionPanel
        reportId="789"
        currentStatus="SUSPENDED"
        onActionComplete={() => {}}
      />
    );

    const selectTrigger = screen.getByRole("combobox");
    await user.click(selectTrigger);

    const resolvedOption = await screen.findByRole("option", {
      name: "Resolved",
    });
    await user.click(resolvedOption);

    const button = screen.getByRole("button", { name: /Update Status/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("An unexpected error occurred")).toBeInTheDocument();
    });
  });

  it("should display loading state during update", async () => {
    const user = userEvent.setup();
    mockUpdateReportStatus.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: {} }), 100))
    );

    render(
      <MaintainerActionPanel
        reportId="999"
        currentStatus="ASSIGNED"
        onActionComplete={() => {}}
      />
    );

    const selectTrigger = screen.getByRole("combobox");
    await user.click(selectTrigger);

    const inProgressOption = await screen.findByRole("option", {
      name: "In Progress",
    });
    await user.click(inProgressOption);

    const button = screen.getByRole("button", { name: /Update Status/i });
    await user.click(button);

    expect(screen.getByText("Updating...")).toBeInTheDocument();
    expect(button).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText("Status updated successfully")).toBeInTheDocument();
    });
  });

  it("should render note about status changes", () => {
    render(
      <MaintainerActionPanel
        reportId="1"
        currentStatus="ASSIGNED"
        onActionComplete={() => {}}
      />
    );

    expect(
      screen.getByText(/You can change the report status to In Progress, Suspended, or Resolved/i)
    ).toBeInTheDocument();
  });

  it("should render with numeric reportId", () => {
    render(
      <MaintainerActionPanel
        reportId={12345}
        currentStatus="RESOLVED"
        onActionComplete={() => {}}
      />
    );

    expect(screen.getByText("Update Report Status")).toBeInTheDocument();
    expect(screen.getAllByText("Resolved").length).toBeGreaterThan(0);
  });

  it("should work without onActionComplete callback", async () => {
    const user = userEvent.setup();
    mockUpdateReportStatus.mockResolvedValue({
      success: true,
      data: {},
    });

    render(
      <MaintainerActionPanel reportId="1" currentStatus="ASSIGNED" />
    );

    const selectTrigger = screen.getByRole("combobox");
    await user.click(selectTrigger);

    const resolvedOption = await screen.findByRole("option", {
      name: "Resolved",
    });
    await user.click(resolvedOption);

    const button = screen.getByRole("button", { name: /Update Status/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("Status updated successfully")).toBeInTheDocument();
    });
  });
});
