import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CompanyForm, { CompanyFormData } from "@/components/CompanyForm";

describe("CompanyForm", () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render company form with all fields", () => {
    render(<CompanyForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText("Create a new company")).toBeInTheDocument();
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
  });

  it("should display validation errors for required fields", async () => {
    render(<CompanyForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole("button", { name: /save company/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Company name is required.")).toBeInTheDocument();
      expect(screen.getByText("Email is required.")).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should accept email input", () => {
    render(<CompanyForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: "test@company.com" } });

    expect(emailInput).toHaveValue("test@company.com");
  });

  it("should validate phone number format", async () => {
    render(<CompanyForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/company name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const phoneInput = screen.getByLabelText(/phone/i);

    fireEvent.change(nameInput, { target: { value: "Test Company" } });
    fireEvent.change(emailInput, { target: { value: "test@company.com" } });
    fireEvent.change(phoneInput, { target: { value: "123" } });

    const submitButton = screen.getByRole("button", { name: /save company/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid phone number.")).toBeInTheDocument();
    });
  });

  it("should submit form with valid data", async () => {
    mockOnSubmit.mockResolvedValue(true);

    render(<CompanyForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/company name/i), {
      target: { value: "Test Company" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@company.com" },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: "+1234567890" },
    });

    const submitButton = screen.getByRole("button", { name: /save company/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: "Test Company",
        email: "test@company.com",
        phone: "+1234567890",
        hasAccess: false,
      });
    });
  });

  it("should clear validation errors when user types", async () => {
    render(<CompanyForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole("button", { name: /save company/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Company name is required.")).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/company name/i);
    fireEvent.change(nameInput, { target: { value: "Test" } });

    await waitFor(() => {
      expect(screen.queryByText("Company name is required.")).not.toBeInTheDocument();
    });
  });

  it("should populate form with initial data", () => {
    const initialData: Partial<CompanyFormData> = {
      name: "Initial Company",
      email: "initial@company.com",
      phone: "+1234567890",
      hasAccess: true,
    };

    render(<CompanyForm onSubmit={mockOnSubmit} initialData={initialData} />);

    expect(screen.getByLabelText(/company name/i)).toHaveValue("Initial Company");
    expect(screen.getByLabelText(/email/i)).toHaveValue("initial@company.com");
    expect(screen.getByLabelText(/phone/i)).toHaveValue("+1234567890");
  });

  it("should use custom submit label", () => {
    render(<CompanyForm onSubmit={mockOnSubmit} submitLabel="Create Company" />);

    expect(screen.getByRole("button", { name: "Create Company" })).toBeInTheDocument();
  });

  it("should use custom title and description", () => {
    render(
      <CompanyForm
        onSubmit={mockOnSubmit}
        title="Edit Company"
        description="Update company information"
      />
    );

    expect(screen.getByText("Edit Company")).toBeInTheDocument();
    expect(screen.getByText("Update company information")).toBeInTheDocument();
  });

  it("should call onCancel when cancel button is clicked", () => {
    render(<CompanyForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("should disable submit button during submission", async () => {
    mockOnSubmit.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(true), 1000))
    );

    render(<CompanyForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/company name/i), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@test.com" },
    });

    const submitButton = screen.getByRole("button", { name: /save company/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it("should trim whitespace from input values", async () => {
    mockOnSubmit.mockResolvedValue(true);

    render(<CompanyForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/company name/i), {
      target: { value: "  Test Company  " },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "  test@company.com  " },
    });

    const submitButton = screen.getByRole("button", { name: /save company/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test Company",
          email: "test@company.com",
        })
      );
    });
  });

  it("should handle hasAccess checkbox", () => {
    render(<CompanyForm onSubmit={mockOnSubmit} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});
