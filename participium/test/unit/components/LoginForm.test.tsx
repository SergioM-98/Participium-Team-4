import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginForm from "@/components/LoginForm";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

// Mock dependencies
jest.mock("next-auth/react");
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe("LoginForm", () => {
  const mockSearchParams = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    (signIn as jest.Mock).mockResolvedValue({ error: null });
  });

  it("should render login form with all fields", () => {
    render(<LoginForm />);

    expect(screen.getByText("Welcome back!")).toBeInTheDocument();
    expect(screen.getByLabelText("Username or Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("should display registration success message when registered param is present", () => {
    mockSearchParams.get.mockReturnValue("true");

    render(<LoginForm />);

    expect(screen.getByText("Registration successful! Please log in.")).toBeInTheDocument();
  });

  it("should toggle password visibility", () => {
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const toggleButton = screen.getByRole("button", { name: "" });

    expect(passwordInput.type).toBe("password");

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("text");

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("password");
  });

  it("should render submit button", () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    expect(submitButton).toBeInTheDocument();
  });

  it("should call signIn with correct credentials", async () => {
    render(<LoginForm />);

    const identifierInput = screen.getByLabelText("Username or Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(identifierInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("credentials", {
        redirect: true,
        callbackUrl: "/",
        identifier: "testuser",
        password: "password123",
      });
    });
  });

  it("should display error message from signIn", async () => {
    (signIn as jest.Mock).mockResolvedValue({ error: "CredentialsSignin" });

    render(<LoginForm />);

    const identifierInput = screen.getByLabelText("Username or Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(identifierInput, { target: { value: "wronguser" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Wrong credentials")).toBeInTheDocument();
    });
  });

  it("should display verification error message", async () => {
    (signIn as jest.Mock).mockResolvedValue({ error: "Verification" });

    render(<LoginForm />);

    const identifierInput = screen.getByLabelText("Username or Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(identifierInput, { target: { value: "unverified" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Account verification pending/i)
      ).toBeInTheDocument();
    });
  });

  it("should disable inputs during pending state", async () => {
    (signIn as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({}), 1000))
    );

    render(<LoginForm />);

    const identifierInput = screen.getByLabelText("Username or Email") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /sign in/i }) as HTMLButtonElement;

    fireEvent.change(identifierInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(identifierInput.disabled).toBe(true);
      expect(passwordInput.disabled).toBe(true);
      expect(submitButton.disabled).toBe(true);
      expect(screen.getByText("Signing in...")).toBeInTheDocument();
    });
  });

  it("should update inputs when user types", () => {
    render(<LoginForm />);

    const identifierInput = screen.getByLabelText("Username or Email");
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);

    fireEvent.change(identifierInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(identifierInput).toHaveValue("testuser");
    expect(passwordInput).toHaveValue("password123");
  });

  it("should display server error from props", () => {
    render(<LoginForm serverError="Server is down" />);

    expect(screen.getByText("Server is down")).toBeInTheDocument();
  });

  it("should display error from URL params", () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === "error") return "AccessDenied";
      return null;
    });

    render(<LoginForm />);

    expect(screen.getByText("Access denied")).toBeInTheDocument();
  });

  it("should render sign up link", () => {
    render(<LoginForm />);

    const signUpLink = screen.getByRole("link", { name: /sign up/i });
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute("href", "/register");
  });

  it("should handle generic error from signIn", async () => {
    (signIn as jest.Mock).mockResolvedValue({ error: "UnknownError" });

    render(<LoginForm />);

    const identifierInput = screen.getByLabelText("Username or Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(identifierInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("UnknownError")).toBeInTheDocument();
    });
  });

  it("should handle signIn exception", async () => {
    (signIn as jest.Mock).mockRejectedValue(new Error("Network error"));
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    render(<LoginForm />);

    const identifierInput = screen.getByLabelText("Username or Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(identifierInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Something went wrong. Please try again.")).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });
});
