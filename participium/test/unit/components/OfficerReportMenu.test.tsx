import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OfficerReportMenu from "@/components/OfficerReportMenu";
import { getAllCompanies } from "@/controllers/company.controller";
import {
  assignReportToCompany,
  updateReportStatus,
} from "@/controllers/report.controller";

jest.mock("@/auth", () => ({}));
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));
jest.mock("@/controllers/company.controller");
jest.mock("@/controllers/report.controller");

const mockGetAllCompanies = getAllCompanies as jest.MockedFunction<typeof getAllCompanies>;
const mockAssignReportToCompany = assignReportToCompany as jest.MockedFunction<
  typeof assignReportToCompany
>;
const mockUpdateReportStatus = updateReportStatus as jest.MockedFunction<
  typeof updateReportStatus
>;

const mockCompanies = [
  { id: "1", name: "Company A", hasAccess: true, email: "companya@test.com" },
  { id: "2", name: "Company B", hasAccess: false, email: "companyb@test.com" },
];

describe("OfficerReportMenu", () => {
  const mockSetRefreshFlag = jest.fn();
  const mockSetReport = jest.fn();
  const mockShowToast = jest.fn();

  const defaultProps = {
    reportId: "123",
    reportTitle: "Test Report",
    status: "assigned",
    companyId: null,
    setRefreshFlag: mockSetRefreshFlag,
    setReport: mockSetReport,
    showToast: mockShowToast,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllCompanies.mockResolvedValue({
      success: true,
      data: mockCompanies,
    });
    mockAssignReportToCompany.mockResolvedValue({
      success: true,
      data: {},
    });
    mockUpdateReportStatus.mockResolvedValue({
      success: true,
      data: {},
    });
  });

  it("should render and fetch companies on mount", async () => {
    render(<OfficerReportMenu {...defaultProps} />);

    await waitFor(() => {
      expect(mockGetAllCompanies).toHaveBeenCalled();
    });
  });

  it("should display company selector when no company assigned", async () => {
    render(<OfficerReportMenu {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Assign Company")).toBeInTheDocument();
    });
  });

  it("should display assigned company when companyId is provided", async () => {
    render(<OfficerReportMenu {...defaultProps} companyId="1" />);

    await waitFor(() => {
      expect(screen.getByText("Company A")).toBeInTheDocument();
      expect(screen.getByText("Assigned")).toBeInTheDocument();
    });
  });

  it("should allow selecting a company", async () => {
    const user = userEvent.setup();
    render(<OfficerReportMenu {...defaultProps} />);

    await waitFor(() => {
      expect(mockGetAllCompanies).toHaveBeenCalled();
    });

    const select = screen.getByRole("combobox");
    await user.click(select);

    const option = await screen.findByRole("option", { name: "Company A" });
    await user.click(option);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Assign/i })).toBeEnabled();
    });
  });

  it("should assign company when Assign button is clicked", async () => {
    const user = userEvent.setup();
    render(<OfficerReportMenu {...defaultProps} />);

    await waitFor(() => {
      expect(mockGetAllCompanies).toHaveBeenCalled();
    });

    const select = screen.getByRole("combobox");
    await user.click(select);

    const option = await screen.findByRole("option", { name: "Company A" });
    await user.click(option);

    const assignButton = screen.getByRole("button", { name: /Assign/i });
    await user.click(assignButton);

    await waitFor(() => {
      expect(mockAssignReportToCompany).toHaveBeenCalledWith(123, "1");
      expect(mockSetRefreshFlag).toHaveBeenCalled();
      expect(mockSetReport).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith(
        "success",
        expect.stringContaining("Assigned company Company A")
      );
    });
  });

  it("should show email in toast for company without access", async () => {
    const user = userEvent.setup();
    render(<OfficerReportMenu {...defaultProps} />);

    await waitFor(() => {
      expect(mockGetAllCompanies).toHaveBeenCalled();
    });

    const select = screen.getByRole("combobox");
    await user.click(select);

    const option = await screen.findByRole("option", { name: "Company B" });
    await user.click(option);

    const assignButton = screen.getByRole("button", { name: /Assign/i });
    await user.click(assignButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        "success",
        expect.stringContaining("companyb@test.com")
      );
    });
  });

  it("should display current status", () => {
    render(<OfficerReportMenu {...defaultProps} />);

    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(screen.getByText("assigned")).toBeInTheDocument();
  });

  it("should display next status for assigned status", () => {
    render(<OfficerReportMenu {...defaultProps} status="assigned" />);

    expect(screen.getByText("Next")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
  });

  it("should display next status for suspended status", () => {
    render(<OfficerReportMenu {...defaultProps} status="suspended" />);

    expect(screen.getByText("Next")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
  });

  it("should show Update button for assigned status", () => {
    render(<OfficerReportMenu {...defaultProps} status="assigned" />);

    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();
  });

  it("should update status to IN_PROGRESS when Update is clicked", async () => {
    const user = userEvent.setup();
    render(<OfficerReportMenu {...defaultProps} status="assigned" />);

    const updateButton = screen.getByRole("button", { name: "Update" });
    await user.click(updateButton);

    await waitFor(() => {
      expect(mockUpdateReportStatus).toHaveBeenCalledWith("IN_PROGRESS", "123");
      expect(mockSetRefreshFlag).toHaveBeenCalled();
      expect(mockSetReport).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith(
        "success",
        expect.stringContaining("In Progress")
      );
    });
  });

  it("should update status to RESOLVED when Update is clicked for in_progress", async () => {
    const user = userEvent.setup();
    render(<OfficerReportMenu {...defaultProps} status="in_progress" />);

    const updateButton = screen.getByRole("button", { name: "Update" });
    await user.click(updateButton);

    await waitFor(() => {
      expect(mockUpdateReportStatus).toHaveBeenCalledWith("RESOLVED", "123");
    });
  });

  it("should show Suspend button for assigned status", () => {
    render(<OfficerReportMenu {...defaultProps} status="assigned" />);

    expect(screen.getByRole("button", { name: "Suspend" })).toBeInTheDocument();
  });

  it("should show Suspend button for in_progress status", () => {
    render(<OfficerReportMenu {...defaultProps} status="in_progress" />);

    expect(screen.getByRole("button", { name: "Suspend" })).toBeInTheDocument();
  });

  it("should not show Suspend button for resolved status", () => {
    render(<OfficerReportMenu {...defaultProps} status="resolved" />);

    expect(screen.queryByRole("button", { name: "Suspend" })).not.toBeInTheDocument();
  });

  it("should update status to SUSPENDED when Suspend is clicked", async () => {
    const user = userEvent.setup();
    render(<OfficerReportMenu {...defaultProps} status="assigned" />);

    const suspendButton = screen.getByRole("button", { name: "Suspend" });
    await user.click(suspendButton);

    await waitFor(() => {
      expect(mockUpdateReportStatus).toHaveBeenCalledWith("SUSPENDED", "123");
      expect(mockShowToast).toHaveBeenCalledWith(
        "success",
        expect.stringContaining("Suspended")
      );
    });
  });

  it("should not show Update button for resolved status", () => {
    render(<OfficerReportMenu {...defaultProps} status="resolved" />);

    expect(screen.queryByRole("button", { name: "Update" })).not.toBeInTheDocument();
  });

  it("should not show Next status for resolved status", () => {
    render(<OfficerReportMenu {...defaultProps} status="resolved" />);

    expect(screen.queryByText("Next")).not.toBeInTheDocument();
  });

  it("should disable Update button when company is selected", async () => {
    const user = userEvent.setup();
    render(<OfficerReportMenu {...defaultProps} status="assigned" />);

    await waitFor(() => {
      expect(mockGetAllCompanies).toHaveBeenCalled();
    });

    const select = screen.getByRole("combobox");
    await user.click(select);

    const option = await screen.findByRole("option", { name: "Company A" });
    await user.click(option);

    const updateButton = screen.getByRole("button", { name: "Update" });
    expect(updateButton).toBeDisabled();
  });

  it("should disable Suspend button when company is selected", async () => {
    const user = userEvent.setup();
    render(<OfficerReportMenu {...defaultProps} status="assigned" />);

    await waitFor(() => {
      expect(mockGetAllCompanies).toHaveBeenCalled();
    });

    const select = screen.getByRole("combobox");
    await user.click(select);

    const option = await screen.findByRole("option", { name: "Company A" });
    await user.click(option);

    const suspendButton = screen.getByRole("button", { name: "Suspend" });
    expect(suspendButton).toBeDisabled();
  });

  it("should have Assign button disabled when no company selected", async () => {
    render(<OfficerReportMenu {...defaultProps} />);

    await waitFor(() => {
      expect(mockGetAllCompanies).toHaveBeenCalled();
    });

    const assignButton = screen.getByRole("button", { name: /Assign/i });
    expect(assignButton).toBeDisabled();
  });

  it("should display loading state while fetching companies", () => {
    mockGetAllCompanies.mockImplementation(() => new Promise(() => {}));

    render(<OfficerReportMenu {...defaultProps} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should handle companies fetch error", async () => {
    mockGetAllCompanies.mockRejectedValue(new Error("Network error"));

    render(<OfficerReportMenu {...defaultProps} />);

    await waitFor(() => {
      expect(mockGetAllCompanies).toHaveBeenCalled();
    });

    // Should still render without crashing
    expect(screen.getByText("Assign Company")).toBeInTheDocument();
  });

  it("should reset selection to empty when NONE is selected", async () => {
    const user = userEvent.setup();
    render(<OfficerReportMenu {...defaultProps} />);

    await waitFor(() => {
      expect(mockGetAllCompanies).toHaveBeenCalled();
    });

    const select = screen.getByRole("combobox");
    await user.click(select);

    const noneOption = await screen.findByRole("option", { name: "None" });
    await user.click(noneOption);

    const assignButton = screen.getByRole("button", { name: /Assign/i });
    expect(assignButton).toBeDisabled();
  });

  it("should use report ID in update status calls", async () => {
    const user = userEvent.setup();
    render(<OfficerReportMenu {...defaultProps} reportId="999" status="assigned" />);

    const updateButton = screen.getByRole("button", { name: "Update" });
    await user.click(updateButton);

    await waitFor(() => {
      expect(mockUpdateReportStatus).toHaveBeenCalledWith("IN_PROGRESS", "999");
    });
  });

  it("should display report title in toast message", async () => {
    const user = userEvent.setup();
    render(<OfficerReportMenu {...defaultProps} reportTitle="My Custom Report" status="assigned" />);

    const updateButton = screen.getByRole("button", { name: "Update" });
    await user.click(updateButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        "success",
        expect.stringContaining("My Custom Report")
      );
    });
  });

  it("should use report ID as fallback in toast when no title", async () => {
    const user = userEvent.setup();
    render(<OfficerReportMenu {...defaultProps} reportTitle={undefined} reportId="456" status="assigned" />);

    const updateButton = screen.getByRole("button", { name: "Update" });
    await user.click(updateButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        "success",
        expect.stringContaining("#456")
      );
    });
  });

  it("should display formatted status labels", () => {
    render(<OfficerReportMenu {...defaultProps} status="in_progress" />);

    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("should display company avatar with first letter", async () => {
    render(<OfficerReportMenu {...defaultProps} companyId="1" />);

    await waitFor(() => {
      expect(screen.getByText("C")).toBeInTheDocument();
    });
  });
});
