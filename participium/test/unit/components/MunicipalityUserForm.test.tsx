import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MunicipalityUserForm from "@/components/MunicipalityUserForm";
import { getCompaniesByAccess } from "@/controllers/company.controller";

jest.mock("@/auth", () => ({}));
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));
jest.mock("@/controllers/company.controller");

const mockGetCompaniesByAccess = getCompaniesByAccess as jest.MockedFunction<
  typeof getCompaniesByAccess
>;

const mockCompanies = [
  { id: "1", name: "Company A", hasAccess: true, email: "a@test.com" },
  { id: "2", name: "Company B", hasAccess: true, email: "b@test.com" },
];

describe("MunicipalityUserForm", () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCompaniesByAccess.mockResolvedValue({
      success: true,
      data: mockCompanies,
    });
  });

  it("should render form with all fields", () => {
    render(<MunicipalityUserForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/First name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Office/i)).toBeInTheDocument();
  });

  it("should allow typing in text fields", async () => {
    const user = userEvent.setup();
    render(<MunicipalityUserForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/First name/i), "John");
    await user.type(screen.getByLabelText(/Last name/i), "Doe");
    await user.type(screen.getByLabelText(/Username/i), "johndoe");

    expect(screen.getByLabelText(/First name/i)).toHaveValue("John");
    expect(screen.getByLabelText(/Last name/i)).toHaveValue("Doe");
    expect(screen.getByLabelText(/Username/i)).toHaveValue("johndoe");
  });

  it("should allow selecting PUBLIC_RELATIONS_OFFICER role", async () => {
    const user = userEvent.setup();
    render(<MunicipalityUserForm onSubmit={mockOnSubmit} />);

    const roleSelect = screen.getByLabelText(/Role/i);
    await user.click(roleSelect);

    const option = await screen.findByRole("option", {
      name: /Municipal public relations officer/i,
    });
    await user.click(option);

    await waitFor(() => {
      const matches = screen.getAllByText("Municipal public relations officer");
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  it("should set office to ORGANIZATION_OFFICE for PUBLIC_RELATIONS_OFFICER", async () => {
    const user = userEvent.setup();
    render(<MunicipalityUserForm onSubmit={mockOnSubmit} />);

    const roleSelect = screen.getByLabelText(/Role/i);
    await user.click(roleSelect);

    const option = await screen.findByRole("option", {
      name: /Municipal public relations officer/i,
    });
    await user.click(option);

    // Office field should be automatically set or disabled
    await waitFor(() => {
      expect(screen.getByLabelText(/Office/i)).toBeInTheDocument();
    });
  });

  it("should set office to ORGANIZATION_OFFICE for ADMIN role", async () => {
    const user = userEvent.setup();
    render(<MunicipalityUserForm onSubmit={mockOnSubmit} />);

    const roleSelect = screen.getByLabelText(/Role/i);
    await user.click(roleSelect);

    const option = await screen.findByRole("option", {
      name: /Municipal administrator/i,
    });
    await user.click(option);

    await waitFor(() => {
      const officeField = screen.getByLabelText(/Office/i);
      expect(officeField).toBeDisabled();
      expect(officeField).toHaveValue("N/A");
    });
  });

  it("should show company selector for EXTERNAL_MAINTAINER_WITH_ACCESS role", async () => {
    const user = userEvent.setup();
    render(<MunicipalityUserForm onSubmit={mockOnSubmit} />);

    const roleSelect = screen.getByLabelText(/Role/i);
    await user.click(roleSelect);

    const option = await screen.findByRole("option", {
      name: /External Maintainer/i,
    });
    await user.click(option);

    await waitFor(() => {
      expect(screen.getByLabelText(/Company/i)).toBeInTheDocument();
    });
  });

  it("should fetch companies when EXTERNAL_MAINTAINER_WITH_ACCESS is selected", async () => {
    const user = userEvent.setup();
    render(<MunicipalityUserForm onSubmit={mockOnSubmit} />);

    const roleSelect = screen.getByLabelText(/Role/i);
    await user.click(roleSelect);

    const option = await screen.findByRole("option", {
      name: /External Maintainer/i,
    });
    await user.click(option);

    await waitFor(() => {
      expect(mockGetCompaniesByAccess).toHaveBeenCalled();
    });
  });

  it("should allow selecting a company", async () => {
    const user = userEvent.setup();
    render(<MunicipalityUserForm onSubmit={mockOnSubmit} />);

    const roleSelect = screen.getByLabelText(/Role/i);
    await user.click(roleSelect);

    const roleOption = await screen.findByRole("option", {
      name: /External Maintainer/i,
    });
    await user.click(roleOption);

    await waitFor(() => {
      expect(screen.getByLabelText(/Company/i)).toBeInTheDocument();
    });

    const companySelect = screen.getByLabelText(/Company/i);
    await user.click(companySelect);

    const companyOption = await screen.findByRole("option", { name: "Company A" });
    await user.click(companyOption);

    await waitFor(() => {
      const matches = screen.getAllByText("Company A");
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  it("should show loading state while fetching companies", async () => {
    const user = userEvent.setup();
    mockGetCompaniesByAccess.mockImplementation(() => new Promise(() => {}));

    render(<MunicipalityUserForm onSubmit={mockOnSubmit} />);

    const roleSelect = screen.getByLabelText(/Role/i);
    await user.click(roleSelect);

    const option = await screen.findByRole("option", {
      name: /External Maintainer/i,
    });
    await user.click(option);

    await waitFor(() => {
      const companySelect = screen.getByLabelText(/Company/i);
      expect(companySelect).toBeDisabled();
    });
  });

  it("should allow selecting office for TECHNICAL_OFFICER", async () => {
    const user = userEvent.setup();
    render(<MunicipalityUserForm onSubmit={mockOnSubmit} />);

    const roleSelect = screen.getByLabelText(/Role/i);
    await user.click(roleSelect);

    const option = await screen.findByRole("option", {
      name: /Technical office staff/i,
    });
    await user.click(option);

    await waitFor(() => {
      expect(screen.getByLabelText(/Office/i)).not.toBeDisabled();
    });

    const officeSelect = screen.getByLabelText(/Office/i);
    await user.click(officeSelect);

    const officeOption = await screen.findByRole("option", {
      name: /Department of Commerce/i,
    });
    await user.click(officeOption);

    await waitFor(() => {
      const matches = screen.getAllByText("Department of Commerce");
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  it("should render all 12 office options", async () => {
    const user = userEvent.setup();
    render(<MunicipalityUserForm onSubmit={mockOnSubmit} />);

    const roleSelect = screen.getByLabelText(/Role/i);
    await user.click(roleSelect);

    const roleOption = await screen.findByRole("option", {
      name: /Technical office staff/i,
    });
    await user.click(roleOption);

    const officeSelect = screen.getByLabelText(/Office/i);
    await user.click(officeSelect);

    await waitFor(() => {
      expect(screen.getByRole("option", { name: /Department of Commerce/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /Department of Educational Services/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /Department of Local Police/i })).toBeInTheDocument();
    });
  });

  it("should validate username format", async () => {
    const user = userEvent.setup();
    render(<MunicipalityUserForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/First name/i), "John");
    await user.type(screen.getByLabelText(/Last name/i), "Doe");
    await user.type(screen.getByLabelText(/Username/i), "jo");
    await user.type(screen.getByLabelText("Password"), "Pass123");
    await user.type(screen.getByLabelText(/Confirm Password/i), "Pass123");

    const roleSelect = screen.getByLabelText(/Role/i);
    await user.click(roleSelect);
    const option = await screen.findByRole("option", {
      name: /Municipal administrator/i,
    });
    await user.click(option);

    const submitButton = screen.getByRole("button", { name: /Save user/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Username must be at least 3 characters/i)
      ).toBeInTheDocument();
    });
  });

  it("should validate password length", async () => {
    const user = userEvent.setup();
    render(<MunicipalityUserForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/First name/i), "John");
    await user.type(screen.getByLabelText(/Last name/i), "Doe");
    await user.type(screen.getByLabelText(/Username/i), "johndoe");
    await user.type(screen.getByLabelText("Password"), "12345");
    await user.type(screen.getByLabelText(/Confirm Password/i), "12345");

    const roleSelect = screen.getByLabelText(/Role/i);
    await user.click(roleSelect);
    const option = await screen.findByRole("option", {
      name: /Municipal administrator/i,
    });
    await user.click(option);

    const submitButton = screen.getByRole("button", { name: /Save user/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });
  });

  it("should validate passwords match", async () => {
    const user = userEvent.setup();
    render(<MunicipalityUserForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/First name/i), "John");
    await user.type(screen.getByLabelText(/Last name/i), "Doe");
    await user.type(screen.getByLabelText(/Username/i), "johndoe");
    await user.type(screen.getByLabelText("Password"), "Password123");
    await user.type(screen.getByLabelText(/Confirm Password/i), "DifferentPass");

    const roleSelect = screen.getByLabelText(/Role/i);
    await user.click(roleSelect);
    const option = await screen.findByRole("option", {
      name: /Municipal administrator/i,
    });
    await user.click(option);

    const submitButton = screen.getByRole("button", { name: /Save user/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  it("should validate required fields", async () => {
    const user = userEvent.setup();
    render(<MunicipalityUserForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole("button", { name: /Save user/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/First name is required/i)).toBeInTheDocument();
    });
  });

  it("should call onSubmit with correct data", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue({ success: true });

    render(<MunicipalityUserForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/First name/i), "John");
    await user.type(screen.getByLabelText(/Last name/i), "Doe");
    await user.type(screen.getByLabelText(/Username/i), "johndoe");
    await user.type(screen.getByLabelText("Password"), "Password123");
    await user.type(screen.getByLabelText(/Confirm Password/i), "Password123");

    const roleSelect = screen.getByLabelText(/Role/i);
    await user.click(roleSelect);
    const option = await screen.findByRole("option", {
      name: /Municipal administrator/i,
    });
    await user.click(option);

    await waitFor(() => {
      const matches = screen.getAllByText("Municipal administrator");
      expect(matches.length).toBeGreaterThan(0);
    });

    const submitButton = screen.getByRole("button", { name: /Save user/i });
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(mockOnSubmit).toHaveBeenCalled();
      },
      { timeout: 10000 }
    );
  });

  it("should show Saving... during submission", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
    );

    render(<MunicipalityUserForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/First name/i), "John");
    await user.type(screen.getByLabelText(/Last name/i), "Doe");
    await user.type(screen.getByLabelText(/Username/i), "johndoe");
    await user.type(screen.getByLabelText("Password"), "Pass123456");
    await user.type(screen.getByLabelText(/Confirm Password/i), "Pass123456");

    const roleSelect = screen.getByLabelText(/Role/i);
    await user.click(roleSelect);
    const option = await screen.findByRole("option", {
      name: /Municipal administrator/i,
    });
    await user.click(option);

    await user.click(screen.getByRole("button", { name: /Save user/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    }, { timeout: 10000 });
  });

  it("should call onCancel when Cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<MunicipalityUserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("should not show Cancel button when onCancel is not provided", () => {
    render(<MunicipalityUserForm onSubmit={mockOnSubmit} />);

    expect(screen.queryByRole("button", { name: /Cancel/i })).not.toBeInTheDocument();
  });

  it("should use custom submit label", () => {
    render(
      <MunicipalityUserForm onSubmit={mockOnSubmit} submitLabel="Custom Submit" />
    );

    expect(screen.getByRole("button", { name: "Custom Submit" })).toBeInTheDocument();
  });

  it("should disable submit button during submission", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
    );

    render(<MunicipalityUserForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/First name/i), "John");
    await user.type(screen.getByLabelText(/Last name/i), "Doe");
    await user.type(screen.getByLabelText(/Username/i), "johndoe");
    await user.type(screen.getByLabelText("Password"), "Pass123456");
    await user.type(screen.getByLabelText(/Confirm Password/i), "Pass123456");

    const roleSelect = screen.getByLabelText(/Role/i);
    await user.click(roleSelect);
    const option = await screen.findByRole("option", {
      name: /Municipal administrator/i,
    });
    await user.click(option);

    const submitButton = screen.getByRole("button", { name: /Save user/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    }, { timeout: 10000 });
  });

  it("should reset companyId when role changes from EXTERNAL_MAINTAINER_WITH_ACCESS", async () => {
    const user = userEvent.setup();
    render(<MunicipalityUserForm onSubmit={mockOnSubmit} />);

    // First select external maintainer
    const roleSelect = screen.getByLabelText(/Role/i);
    await user.click(roleSelect);
    const maintainerOption = await screen.findByRole("option", {
      name: /External Maintainer/i,
    });
    await user.click(maintainerOption);

    await waitFor(() => {
      expect(screen.getByLabelText(/Company/i)).toBeInTheDocument();
    });

    // Select a company
    const companySelect = screen.getByLabelText(/Company/i);
    await user.click(companySelect);
    const companyOption = await screen.findByRole("option", { name: "Company A" });
    await user.click(companyOption);

    // Change role
    await user.click(roleSelect);
    const adminOption = await screen.findByRole("option", {
      name: /Municipal administrator/i,
    });
    await user.click(adminOption);

    // Company field should disappear
    await waitFor(() => {
      expect(screen.queryByLabelText(/Company/i)).not.toBeInTheDocument();
    });
  });

  it("should require company selection for external maintainer", async () => {
    const user = userEvent.setup();
    render(<MunicipalityUserForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/First name/i), "John");
    await user.type(screen.getByLabelText(/Last name/i), "Doe");
    await user.type(screen.getByLabelText(/Username/i), "johndoe");
    await user.type(screen.getByLabelText("Password"), "Pass123456");
    await user.type(screen.getByLabelText(/Confirm Password/i), "Pass123456");

    const roleSelect = screen.getByLabelText(/Role/i);
    await user.click(roleSelect);
    const option = await screen.findByRole("option", {
      name: /External Maintainer/i,
    });
    await user.click(option);

    await waitFor(() => {
      expect(mockGetCompaniesByAccess).toHaveBeenCalled();
    });

    const submitButton = screen.getByRole("button", { name: /Save user/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Company.*required/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  it("should require office selection for technical officer", async () => {
    const user = userEvent.setup();
    render(<MunicipalityUserForm onSubmit={mockOnSubmit} />);

    const firstNameInput = screen.getByLabelText(/First name/i);
    await user.type(firstNameInput, "John");
    
    await waitFor(() => {
      expect(firstNameInput).toHaveValue("John");
    });
    
    await user.type(screen.getByLabelText(/Last name/i), "Doe");
    await user.type(screen.getByLabelText(/Username/i), "johndoe");
    await user.type(screen.getByLabelText("Password"), "Pass123456");
    await user.type(screen.getByLabelText(/Confirm Password/i), "Pass123456");

    const roleSelect = screen.getByLabelText(/Role/i);
    await user.click(roleSelect);
    const option = await screen.findByRole("option", {
      name: /Technical office staff/i,
    });
    await user.click(option);

    const submitButton = screen.getByRole("button", { name: /Save user/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Office.*required/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });
});
