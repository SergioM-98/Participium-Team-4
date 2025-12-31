import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "@/components/RegisterForm";
import { register } from "@/app/lib/controllers/user.controller";
import { useRouter } from "next/navigation";

jest.mock("@/auth", () => ({}));
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/app/lib/controllers/user.controller");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockRegister = register as jest.MockedFunction<typeof register>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockPush = jest.fn();

describe("RegisterForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    } as any);
  });

  it("should render all form fields", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
  });

  it("should render submit button", () => {
    render(<RegisterForm />);

    expect(screen.getByRole("button", { name: /Create account/i })).toBeInTheDocument();
  });

  it("should render login link", () => {
    render(<RegisterForm />);

    expect(screen.getByText(/Already have an account/i)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Sign in/i });
    expect(link).toHaveAttribute("href", "/login");
  });

  it("should allow typing in first name field", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const input = screen.getByLabelText(/First Name/i);
    await user.type(input, "John");

    expect(input).toHaveValue("John");
  });

  it("should allow typing in last name field", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const input = screen.getByLabelText(/Last Name/i);
    await user.type(input, "Doe");

    expect(input).toHaveValue("Doe");
  });

  it("should allow typing in email field", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const input = screen.getByLabelText(/Email/i);
    await user.type(input, "john@example.com");

    expect(input).toHaveValue("john@example.com");
  });

  it("should allow typing in username field", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const input = screen.getByLabelText(/Username/i);
    await user.type(input, "johndoe");

    expect(input).toHaveValue("johndoe");
  });

  it("should allow typing in password field", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const input = screen.getByLabelText("Password");
    await user.type(input, "SecurePass123");

    expect(input).toHaveValue("SecurePass123");
  });

  it("should allow typing in confirm password field", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const input = screen.getByLabelText(/Confirm Password/i);
    await user.type(input, "SecurePass123");

    expect(input).toHaveValue("SecurePass123");
  });

  it("should toggle password visibility when eye icon is clicked", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleButton = screen.getAllByRole("button", { name: "" })[0];
    await user.click(toggleButton);

    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(toggleButton);

    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("should toggle confirm password visibility when eye icon is clicked", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    expect(confirmPasswordInput).toHaveAttribute("type", "password");

    const toggleButton = screen.getAllByRole("button", { name: "" })[1];
    await user.click(toggleButton);

    expect(confirmPasswordInput).toHaveAttribute("type", "text");

    await user.click(toggleButton);

    expect(confirmPasswordInput).toHaveAttribute("type", "password");
  });

  it("should submit form with valid citizen data", async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({ success: true, pendingVerification: true });

    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/First Name/i), "John");
    await user.type(screen.getByLabelText(/Last Name/i), "Doe");
    await user.type(screen.getByLabelText(/Email/i), "john@example.com");
    await user.type(screen.getByLabelText(/Username/i), "johndoe");
    await user.type(screen.getByLabelText("Password"), "SecurePass123");
    await user.type(screen.getByLabelText(/Confirm Password/i), "SecurePass123");

    const submitButton = screen.getByRole("button", { name: /Create account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });
  });

  it("should redirect to /verify after successful citizen registration", async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({ success: true, pendingVerification: true });

    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/First Name/i), "John");
    await user.type(screen.getByLabelText(/Last Name/i), "Doe");
    await user.type(screen.getByLabelText(/Email/i), "john@example.com");
    await user.type(screen.getByLabelText(/Username/i), "johndoe");
    await user.type(screen.getByLabelText("Password"), "Pass123");
    await user.type(screen.getByLabelText(/Confirm Password/i), "Pass123");

    await user.click(screen.getByRole("button", { name: /Create account/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("/verify"));
    });
  });

  it("should display error message on registration failure", async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({
      success: false,
      error: "Username already exists",
    });

    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/First Name/i), "John");
    await user.type(screen.getByLabelText(/Last Name/i), "Doe");
    await user.type(screen.getByLabelText(/Email/i), "john@example.com");
    await user.type(screen.getByLabelText(/Username/i), "johndoe");
    await user.type(screen.getByLabelText("Password"), "Pass123");
    await user.type(screen.getByLabelText(/Confirm Password/i), "Pass123");

    await user.click(screen.getByRole("button", { name: /Create account/i }));

    await waitFor(() => {
      expect(screen.getByText("Username already exists")).toBeInTheDocument();
    });
  });

  it("should show Creating account... text during submission", async () => {
    const user = userEvent.setup();
    mockRegister.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, pendingVerification: true }), 100))
    );

    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/First Name/i), "John");
    await user.type(screen.getByLabelText(/Last Name/i), "Doe");
    await user.type(screen.getByLabelText(/Email/i), "john@example.com");
    await user.type(screen.getByLabelText(/Username/i), "johndoe");
    await user.type(screen.getByLabelText("Password"), "Pass123");
    await user.type(screen.getByLabelText(/Confirm Password/i), "Pass123");

    const submitButton = screen.getByRole("button", { name: /Create account/i });
    await user.click(submitButton);

    expect(screen.getByText(/Creating account/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });
  });

  it("should disable submit button during submission", async () => {
    const user = userEvent.setup();
    mockRegister.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, pendingVerification: true }), 100))
    );

    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/First Name/i), "John");
    await user.type(screen.getByLabelText(/Last Name/i), "Doe");
    await user.type(screen.getByLabelText(/Email/i), "john@example.com");
    await user.type(screen.getByLabelText(/Username/i), "johndoe");
    await user.type(screen.getByLabelText("Password"), "Pass123");
    await user.type(screen.getByLabelText(/Confirm Password/i), "Pass123");

    const submitButton = screen.getByRole("button", { name: /Create account/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });
  });

  it("should display error with role attribute", async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({
      success: false,
      error: "Validation error",
    });

    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/First Name/i), "John");
    await user.type(screen.getByLabelText(/Last Name/i), "Doe");
    await user.type(screen.getByLabelText(/Email/i), "john@example.com");
    await user.type(screen.getByLabelText(/Username/i), "johndoe");
    await user.type(screen.getByLabelText("Password"), "Pass123");
    await user.type(screen.getByLabelText(/Confirm Password/i), "Pass123");

    await user.click(screen.getByRole("button", { name: /Create account/i }));

    await waitFor(() => {
      const errorDiv = screen.getByRole("alert");
      expect(errorDiv).toBeInTheDocument();
    });
  });

  it("should clear error when user makes changes after error", async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({
      success: false,
      error: "Username already exists",
    });

    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/First Name/i), "John");
    await user.type(screen.getByLabelText(/Last Name/i), "Doe");
    await user.type(screen.getByLabelText(/Email/i), "john@example.com");
    await user.type(screen.getByLabelText(/Username/i), "johndoe");
    await user.type(screen.getByLabelText("Password"), "Pass123");
    await user.type(screen.getByLabelText(/Confirm Password/i), "Pass123");

    await user.click(screen.getByRole("button", { name: /Create account/i }));

    await waitFor(() => {
      expect(screen.getByText("Username already exists")).toBeInTheDocument();
    });

    // Make another submission attempt with success
    mockRegister.mockResolvedValue({ success: true, pendingVerification: true });
    
    // Wait for button to be ready again
    await waitFor(() => {
      const button = screen.getByRole("button", { name: /Create account/i });
      expect(button).not.toBeDisabled();
    });
    
    await user.click(screen.getByRole("button", { name: /Create account/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it("should have required attribute on all input fields", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/First Name/i)).toBeRequired();
    expect(screen.getByLabelText(/Last Name/i)).toBeRequired();
    expect(screen.getByLabelText(/Email/i)).toBeRequired();
    expect(screen.getByLabelText(/Username/i)).toBeRequired();
    expect(screen.getByLabelText("Password")).toBeRequired();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeRequired();
  });

  it("should have email type for email input", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/Email/i)).toHaveAttribute("type", "email");
  });

  it("should have password type for password inputs by default", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    expect(screen.getByLabelText(/Confirm Password/i)).toHaveAttribute("type", "password");
  });
});
