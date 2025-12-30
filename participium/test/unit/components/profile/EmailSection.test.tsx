import { render, screen, fireEvent } from "@testing-library/react";
import { EmailSection } from "@/components/profile/EmailSection";

describe("EmailSection", () => {
  const mockOnEmailChange = jest.fn();
  const mockOnValidationErrorChange = jest.fn();

  const defaultProps = {
    email: "test@example.com",
    isEditing: false,
    isPending: false,
    validationError: null,
    onEmailChange: mockOnEmailChange,
    onValidationErrorChange: mockOnValidationErrorChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render email label", () => {
    render(<EmailSection {...defaultProps} />);
    expect(screen.getByText("Email Address")).toBeInTheDocument();
  });

  it("should display email in read-only mode", () => {
    render(<EmailSection {...defaultProps} />);
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("should show 'Not provided' when no email in read-only mode", () => {
    render(<EmailSection {...defaultProps} email="" />);
    expect(screen.getByText("Not provided")).toBeInTheDocument();
  });

  it("should render input field when editing", () => {
    render(<EmailSection {...defaultProps} isEditing={true} />);
    const input = screen.getByPlaceholderText("your@email.com");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("test@example.com");
  });

  it("should call onEmailChange when input value changes", () => {
    render(<EmailSection {...defaultProps} isEditing={true} />);
    const input = screen.getByPlaceholderText("your@email.com");
    
    fireEvent.change(input, { target: { value: "new@example.com" } });
    
    expect(mockOnEmailChange).toHaveBeenCalledWith("new@example.com");
  });

  it("should clear validation error when email changes", () => {
    render(<EmailSection {...defaultProps} isEditing={true} validationError="Invalid email" />);
    const input = screen.getByPlaceholderText("your@email.com");
    
    fireEvent.change(input, { target: { value: "new@example.com" } });
    
    expect(mockOnValidationErrorChange).toHaveBeenCalledWith(null);
  });

  it("should display validation error", () => {
    render(<EmailSection {...defaultProps} isEditing={true} validationError="Invalid email format" />);
    expect(screen.getByText("Invalid email format")).toBeInTheDocument();
  });

  it("should apply error styling to input when validation error exists", () => {
    render(<EmailSection {...defaultProps} isEditing={true} validationError="Invalid email" />);
    const input = screen.getByPlaceholderText("your@email.com");
    expect(input).toHaveClass("border-red-500");
  });

  it("should disable input when pending", () => {
    render(<EmailSection {...defaultProps} isEditing={true} isPending={true} />);
    const input = screen.getByPlaceholderText("your@email.com");
    expect(input).toBeDisabled();
  });

  it("should apply primary color to label when editing", () => {
    const { container } = render(<EmailSection {...defaultProps} isEditing={true} />);
    const label = container.querySelector('label[for="email"]');
    expect(label).toHaveClass("text-primary");
  });

  it("should render Mail icon", () => {
    const { container } = render(<EmailSection {...defaultProps} />);
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should not clear validation error if no error exists", () => {
    render(<EmailSection {...defaultProps} isEditing={true} validationError={null} />);
    const input = screen.getByPlaceholderText("your@email.com");
    
    fireEvent.change(input, { target: { value: "new@example.com" } });
    
    expect(mockOnValidationErrorChange).not.toHaveBeenCalled();
  });

  it("should have proper input type", () => {
    render(<EmailSection {...defaultProps} isEditing={true} />);
    const input = screen.getByPlaceholderText("your@email.com");
    expect(input).toHaveAttribute("type", "email");
  });
});
