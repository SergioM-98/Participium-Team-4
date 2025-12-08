import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import VerificationForm from "@/components/VerificationForm";
import * as verificationController from "@/app/lib/controllers/verification.controller";
import { useRouter, useSearchParams } from "next/navigation";

// Mock the verification controller
jest.mock("@/app/lib/controllers/verification.controller");

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock the UI components
jest.mock("@/components/ui/button", () => {
  return {
    Button: ({ children, disabled, onClick, type, ...props }: any) => (
      <button type={type} disabled={disabled} onClick={onClick} {...props}>
        {children}
      </button>
    ),
  };
});

jest.mock("@/components/ui/input", () => {
  return {
    Input: (props: any) => <input {...props} />,
  };
});

jest.mock("@/components/ui/label", () => {
  return {
    Label: ({ htmlFor, children }: any) => <label htmlFor={htmlFor}>{children}</label>,
  };
});

jest.mock("@/components/ui/card", () => {
  return {
    Card: ({ children }: any) => <div>{children}</div>,
    CardContent: ({ children }: any) => <div>{children}</div>,
  };
});

describe("VerificationForm Component", () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockSearchParams = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    mockSearchParams.get.mockReturnValue("test@example.com");
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Rendering", () => {
    test("should render the form with correct title and description", () => {
      render(<VerificationForm />);

      expect(screen.getByText("Verify your email")).toBeInTheDocument();
      expect(
        screen.getByText(/We sent a 6-digit code to/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/The code will expire in 30 minutes/i)
      ).toBeInTheDocument();
    });

    test("should render the verification code input field", () => {
      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "text");
      expect(input).toHaveAttribute("maxLength", "6");
      expect(input).toHaveAttribute("inputMode", "numeric");
      expect(input).toHaveAttribute("required");
    });

    test("should display the email from search params in the description", () => {
      mockSearchParams.get.mockReturnValue("user@example.com");
      render(<VerificationForm />);

      expect(screen.getByText(/user@example.com/)).toBeInTheDocument();
    });

    test("should handle missing email in search params", () => {
      mockSearchParams.get.mockReturnValue(null);
      render(<VerificationForm />);

      expect(screen.getByText(/We sent a 6-digit code to\s*\./)).toBeInTheDocument();
    });

    test("should render Verify Code button", () => {
      render(<VerificationForm />);

      const submitButton = screen.getByRole("button", { name: /Verify Code/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });

    test("should render Resend Code button", () => {
      render(<VerificationForm />);

      const resendButton = screen.getByRole("button", { name: /Resend Code/i });
      expect(resendButton).toBeInTheDocument();
      expect(resendButton).not.toBeDisabled();
    });

    test("should render Register again link", () => {
      render(<VerificationForm />);

      const registerLink = screen.getByRole("button", { name: /Register again/i });
      expect(registerLink).toBeInTheDocument();
    });

    test("should render input label", () => {
      render(<VerificationForm />);

      expect(screen.getByText("Verification Code")).toBeInTheDocument();
    });

    test("should render help text about spam folder", () => {
      render(<VerificationForm />);

      expect(
        screen.getByText(/If you don't receive it, check your spam folder/i)
      ).toBeInTheDocument();
    });

    test("should render Having trouble message", () => {
      render(<VerificationForm />);

      expect(screen.getByText(/Having trouble?/i)).toBeInTheDocument();
    });
  });

  describe("Input Handling", () => {
    test("should update code state when user types in the input", () => {
      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "123456" } });

      expect(input.value).toBe("123456");
    });

    test("should limit input to 6 characters", () => {
      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      fireEvent.change(input, { target: { value: "1234567" } });

      // Browser will enforce maxLength
      expect(input).toHaveAttribute("maxLength", "6");
    });

    test("should clear server error message when user types in the input", async () => {
      (verificationController.verifyRegistration as jest.Mock).mockResolvedValue({
        success: false,
        error: "Invalid code",
      });

      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      // Submit invalid form to trigger server error
      fireEvent.change(input, { target: { value: "123456" } });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText("Invalid code")).toBeInTheDocument();
      });

      // Type in the input
      fireEvent.change(input, { target: { value: "654321" } });

      // Error should be cleared immediately
      expect(screen.queryByText("Invalid code")).not.toBeInTheDocument();
    });

    test("should clear validation error when user types in the input", () => {
      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      // Type an invalid code to start with validation state
      fireEvent.change(input, { target: { value: "123" } });

      // Submit empty form to trigger validation error
      fireEvent.click(submitButton);

      // Should have validation error (5 chars instead of 6)
      expect(input).toHaveAttribute("aria-invalid", "true");

      // Type in more to complete the 6 digits
      fireEvent.change(input, { target: { value: "123456" } });

      // Validation error should be cleared
      expect(input).toHaveAttribute("aria-invalid", "false");
    });
  });

  describe("Form Validation", () => {
    test("should show error when code is empty", () => {
      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      const submitButton = screen.getByRole("button", { name: /Verify Code/i });
      
      // Submit with empty code
      fireEvent.click(submitButton);

      // Validation should fail and no API call made
      expect(verificationController.verifyRegistration).not.toHaveBeenCalled();
    });

    test("should validate code format on submission", () => {
      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      // Test with invalid code (less than 6 digits)
      fireEvent.change(input, { target: { value: "12345" } });
      fireEvent.click(submitButton);

      // Should not call API for invalid input
      expect(verificationController.verifyRegistration).not.toHaveBeenCalled();
    });

    test("should accept valid 6-digit numeric code", async () => {
      (verificationController.verifyRegistration as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      fireEvent.change(input, { target: { value: "123456" } });

      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      // Should call API with valid code
      expect(verificationController.verifyRegistration).toHaveBeenCalledWith(
        "test@example.com",
        "123456"
      );
    });

    test("should reject non-numeric characters", () => {
      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      fireEvent.change(input, { target: { value: "12345a" } });
      fireEvent.click(submitButton);

      expect(verificationController.verifyRegistration).not.toHaveBeenCalled();
    });

    test("should accept leading zeros", async () => {
      (verificationController.verifyRegistration as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      fireEvent.change(input, { target: { value: "000123" } });

      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      // Should be accepted
      expect(verificationController.verifyRegistration).toHaveBeenCalledWith(
        "test@example.com",
        "000123"
      );
    });

    test("should trim whitespace from code", async () => {
      (verificationController.verifyRegistration as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      fireEvent.change(input, { target: { value: "  123456  " } });

      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      // Should trim whitespace
      expect(verificationController.verifyRegistration).toHaveBeenCalledWith(
        "test@example.com",
        "123456"
      );
    });
  });

  describe("Form Submission", () => {
    test("should call verifyRegistration with email and code on valid submit", async () => {
      (verificationController.verifyRegistration as jest.Mock).mockResolvedValue({
        success: true,
      });

      mockSearchParams.get.mockReturnValue("test@example.com");

      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      fireEvent.change(input, { target: { value: "123456" } });

      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(verificationController.verifyRegistration).toHaveBeenCalledWith(
          "test@example.com",
          "123456"
        );
      });
    });

    test("should trim whitespace from email and code before submission", async () => {
      (verificationController.verifyRegistration as jest.Mock).mockResolvedValue({
        success: true,
      });

      mockSearchParams.get.mockReturnValue("  test@example.com  ");

      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      fireEvent.change(input, { target: { value: "  123456  " } });

      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(verificationController.verifyRegistration).toHaveBeenCalledWith(
          "test@example.com",
          "123456"
        );
      });
    });

    test("should show success message on successful verification", async () => {
      (verificationController.verifyRegistration as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      fireEvent.change(input, { target: { value: "123456" } });

      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Email verified successfully! Redirecting to login...")
        ).toBeInTheDocument();
      });
    });

    test("should show error message when verification fails", async () => {
      (verificationController.verifyRegistration as jest.Mock).mockResolvedValue({
        success: false,
        error: "Invalid verification code",
      });

      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      fireEvent.change(input, { target: { value: "123456" } });

      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText("Invalid verification code")).toBeInTheDocument();
      });
    });

    test("should show generic error message on exception", async () => {
      (verificationController.verifyRegistration as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      fireEvent.change(input, { target: { value: "123456" } });

      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Something went wrong. Please try again.")
        ).toBeInTheDocument();
      });
    });

    test("should disable buttons while verifying", async () => {
      let resolveFn: any;
      (verificationController.verifyRegistration as jest.Mock).mockReturnValue(
        new Promise((resolve) => {
          resolveFn = resolve;
        })
      );

      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      fireEvent.change(input, { target: { value: "123456" } });

      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      fireEvent.click(submitButton);

      // Button should show "Verifying..." text and be disabled
      expect(screen.getByRole("button", { name: /Verifying.../i })).toBeDisabled();
      expect(input).toBeDisabled();

      // Resend button should also be disabled
      const resendButton = screen.getByRole("button", { name: /Resend Code/i });
      expect(resendButton).toBeDisabled();

      resolveFn({ success: true });

      await waitFor(() => {
        expect(
          screen.getByText("Email verified successfully! Redirecting to login...")
        ).toBeInTheDocument();
      });
    });

    test("should clear error message when form is reset", async () => {
      (verificationController.verifyRegistration as jest.Mock)
        .mockResolvedValueOnce({
          success: false,
          error: "Invalid code",
        })
        .mockResolvedValueOnce({
          success: false,
          error: "Another error",
        });

      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      fireEvent.change(input, { target: { value: "123456" } });

      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText("Invalid code")).toBeInTheDocument();
      });

      // Submit form again with new input
      fireEvent.change(input, { target: { value: "654321" } });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      // Previous error should be cleared, and new error shown
      expect(screen.queryByText("Invalid code")).not.toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText("Another error")).toBeInTheDocument();
      });
    });

    test("should redirect to login after 2 seconds on successful verification", async () => {
      (verificationController.verifyRegistration as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      fireEvent.change(input, { target: { value: "123456" } });

      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Email verified successfully! Redirecting to login...")
        ).toBeInTheDocument();
      });

      // Advance time by 2 seconds
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      expect(mockRouter.push).toHaveBeenCalledWith("/login");
    });
  });

  describe("Resend Code Functionality", () => {
    test("should call resendVerificationCode when resend button is clicked", async () => {
      (verificationController.resendVerificationCode as jest.Mock).mockResolvedValue({
        success: true,
      });

      mockSearchParams.get.mockReturnValue("test@example.com");

      render(<VerificationForm />);

      const resendButton = screen.getByRole("button", { name: /Resend Code/i });

      await act(async () => {
        fireEvent.click(resendButton);
      });

      await waitFor(() => {
        expect(verificationController.resendVerificationCode).toHaveBeenCalledWith(
          "test@example.com"
        );
      });
    });

    test("should show success message when code is resent successfully", async () => {
      (verificationController.resendVerificationCode as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<VerificationForm />);

      const resendButton = screen.getByRole("button", { name: /Resend Code/i });

      await act(async () => {
        fireEvent.click(resendButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Verification code sent! Check your email.")
        ).toBeInTheDocument();
      });
    });

    test("should show error message when resend fails", async () => {
      (verificationController.resendVerificationCode as jest.Mock).mockResolvedValue({
        success: false,
        error: "Too many requests. Please wait before trying again.",
      });

      render(<VerificationForm />);

      const resendButton = screen.getByRole("button", { name: /Resend Code/i });

      await act(async () => {
        fireEvent.click(resendButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Too many requests. Please wait before trying again.")
        ).toBeInTheDocument();
      });
    });

    test("should show generic error message on resend exception", async () => {
      (verificationController.resendVerificationCode as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      render(<VerificationForm />);

      const resendButton = screen.getByRole("button", { name: /Resend Code/i });

      await act(async () => {
        fireEvent.click(resendButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Failed to resend verification code. Please try again.")
        ).toBeInTheDocument();
      });
    });

    test("should start countdown timer after successful resend", async () => {
      (verificationController.resendVerificationCode as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<VerificationForm />);

      const resendButton = screen.getByRole("button", { name: /Resend Code/i });

      await act(async () => {
        fireEvent.click(resendButton);
      });

      // Wait for success message
      await waitFor(() => {
        expect(
          screen.getByText("Verification code sent! Check your email.")
        ).toBeInTheDocument();
      });

      // Check that countdown button is visible
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Resend in 60s/i })).toBeInTheDocument();
      });
    });

    test("should disable resend button during countdown", async () => {
      (verificationController.resendVerificationCode as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<VerificationForm />);

      const resendButton = screen.getByRole("button", { name: /Resend Code/i });

      await act(async () => {
        fireEvent.click(resendButton);
      });

      await waitFor(() => {
        const countdownButton = screen.getByRole("button", { name: /Resend in 60s/i });
        expect(countdownButton).toBeDisabled();
      });
    });

    test("should decrement countdown timer every second", async () => {
      (verificationController.resendVerificationCode as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<VerificationForm />);

      const resendButton = screen.getByRole("button", { name: /Resend Code/i });

      await act(async () => {
        fireEvent.click(resendButton);
      });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Resend in 60s/i })).toBeInTheDocument();
      });

      // Advance timer by 1 second
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByRole("button", { name: /Resend in 59s/i })).toBeInTheDocument();

      // Advance timer by 10 seconds
      await act(async () => {
        jest.advanceTimersByTime(10000);
      });

      expect(screen.getByRole("button", { name: /Resend in 49s/i })).toBeInTheDocument();
    });

    test("should re-enable resend button when countdown reaches 0", async () => {
      (verificationController.resendVerificationCode as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<VerificationForm />);

      const resendButton = screen.getByRole("button", { name: /Resend Code/i });

      await act(async () => {
        fireEvent.click(resendButton);
      });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Resend in 60s/i })).toBeInTheDocument();
      });

      // Advance timer to complete countdown (60 seconds)
      await act(async () => {
        jest.advanceTimersByTime(61000);
      });

      expect(screen.getByRole("button", { name: /Resend Code/i })).not.toBeDisabled();
    });

    test("should clear success message after 3 seconds", async () => {
      (verificationController.resendVerificationCode as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<VerificationForm />);

      const resendButton = screen.getByRole("button", { name: /Resend Code/i });

      await act(async () => {
        fireEvent.click(resendButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Verification code sent! Check your email.")
        ).toBeInTheDocument();
      });

      // Advance timer by 3 seconds
      await act(async () => {
        jest.advanceTimersByTime(3000);
      });

      expect(
        screen.queryByText("Verification code sent! Check your email.")
      ).not.toBeInTheDocument();
    });

    test("should disable resend button while resending", async () => {
      let resolveFn: any;
      (verificationController.resendVerificationCode as jest.Mock).mockReturnValue(
        new Promise((resolve) => {
          resolveFn = resolve;
        })
      );

      render(<VerificationForm />);

      const resendButton = screen.getByRole("button", { name: /Resend Code/i });

      fireEvent.click(resendButton);

      // Button should be disabled while resending
      expect(resendButton).toBeDisabled();

      resolveFn({ success: true });

      await waitFor(() => {
        expect(
          screen.getByText("Verification code sent! Check your email.")
        ).toBeInTheDocument();
      });
    });

    test("should trim email before sending resend request", async () => {
      (verificationController.resendVerificationCode as jest.Mock).mockResolvedValue({
        success: true,
      });

      mockSearchParams.get.mockReturnValue("  test@example.com  ");

      render(<VerificationForm />);

      const resendButton = screen.getByRole("button", { name: /Resend Code/i });

      await act(async () => {
        fireEvent.click(resendButton);
      });

      await waitFor(() => {
        expect(verificationController.resendVerificationCode).toHaveBeenCalledWith(
          "test@example.com"
        );
      });
    });

    test("should clear error message when resend is clicked", async () => {
      (verificationController.verifyRegistration as jest.Mock).mockResolvedValue({
        success: false,
        error: "Invalid code",
      });
      (verificationController.resendVerificationCode as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      fireEvent.change(input, { target: { value: "123456" } });

      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText("Invalid code")).toBeInTheDocument();
      });

      const resendButton = screen.getByRole("button", { name: /Resend Code/i });

      await act(async () => {
        fireEvent.click(resendButton);
      });

      // Error should be cleared
      expect(screen.queryByText("Invalid code")).not.toBeInTheDocument();
    });

    test("should clear success message when resend is clicked", async () => {
      (verificationController.verifyRegistration as jest.Mock).mockResolvedValue({
        success: true,
      });
      (verificationController.resendVerificationCode as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      fireEvent.change(input, { target: { value: "123456" } });

      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Email verified successfully! Redirecting to login...")
        ).toBeInTheDocument();
      });

      const resendButton = screen.getByRole("button", { name: /Resend Code/i });

      await act(async () => {
        fireEvent.click(resendButton);
      });

      // Success message should be cleared
      expect(
        screen.queryByText("Email verified successfully! Redirecting to login...")
      ).not.toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    test("should navigate to register page when Register again button is clicked", () => {
      render(<VerificationForm />);

      const registerLink = screen.getByRole("button", { name: /Register again/i });
      fireEvent.click(registerLink);

      expect(mockRouter.push).toHaveBeenCalledWith("/register");
    });

    test("should disable Register again button when verifying", async () => {
      let resolveFn: any;
      (verificationController.verifyRegistration as jest.Mock).mockReturnValue(
        new Promise((resolve) => {
          resolveFn = resolve;
        })
      );

      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      fireEvent.change(input, { target: { value: "123456" } });

      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      fireEvent.click(submitButton);

      const registerLink = screen.getByRole("button", { name: /Register again/i });
      expect(registerLink).toBeDisabled();

      resolveFn({ success: true });

      await waitFor(() => {
        expect(
          screen.getByText("Email verified successfully! Redirecting to login...")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    test("should display validation error with aria attributes", () => {
      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      // Enter invalid code and submit
      fireEvent.change(input, { target: { value: "123" } });
      fireEvent.click(submitButton);

      // Should have aria attributes set properly
      expect(input).toHaveAttribute("aria-invalid");
      expect(input).toHaveAttribute("aria-describedby", "code-error");
    });

    test("should remove aria-invalid when error is cleared", () => {
      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000") as HTMLInputElement;
      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      // Trigger validation error
      fireEvent.change(input, { target: { value: "123" } });
      fireEvent.click(submitButton);

      // Change input to clear error
      fireEvent.change(input, { target: { value: "123456" } });

      // Error should be cleared
      expect(input.getAttribute("aria-invalid")).toBe("false");
    });

    test("should handle null error response gracefully", async () => {
      (verificationController.verifyRegistration as jest.Mock).mockResolvedValue({
        success: false,
        error: undefined,
      });

      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      fireEvent.change(input, { target: { value: "123456" } });

      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      // Should not display an error message if error is undefined
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    test("should prevent form submission when validation fails", async () => {
      render(<VerificationForm />);

      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      fireEvent.click(submitButton);

      // Controller should not be called if validation fails
      expect(verificationController.verifyRegistration).not.toHaveBeenCalled();
    });
  });

  describe("UI State Management", () => {
    test("should show proper button text during verification", async () => {
      let resolveFn: any;
      (verificationController.verifyRegistration as jest.Mock).mockReturnValue(
        new Promise((resolve) => {
          resolveFn = resolve;
        })
      );

      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      fireEvent.change(input, { target: { value: "123456" } });

      const submitButton = screen.getByRole("button", { name: /Verify Code/i });
      fireEvent.click(submitButton);

      expect(screen.getByRole("button", { name: /Verifying.../i })).toBeInTheDocument();

      resolveFn({ success: true });

      await waitFor(() => {
        expect(
          screen.getByText("Email verified successfully! Redirecting to login...")
        ).toBeInTheDocument();
      });
    });

    test("should properly display multiple validation errors separately", () => {
      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      // First test: empty input
      fireEvent.click(submitButton);
      expect(verificationController.verifyRegistration).not.toHaveBeenCalled();

      // Second test: partially invalid input
      fireEvent.change(input, { target: { value: "12345" } });
      fireEvent.click(submitButton);
      expect(verificationController.verifyRegistration).not.toHaveBeenCalled();
    });

    test("should correctly display both error and success states", async () => {
      (verificationController.verifyRegistration as jest.Mock)
        .mockResolvedValueOnce({
          success: false,
          error: "Invalid code",
        })
        .mockResolvedValueOnce({
          success: true,
        });

      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      fireEvent.change(input, { target: { value: "123456" } });

      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      // First attempt fails
      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText("Invalid code")).toBeInTheDocument();
      });

      // Second attempt succeeds
      fireEvent.change(input, { target: { value: "654321" } });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Email verified successfully! Redirecting to login...")
        ).toBeInTheDocument();
      });

      // Previous error should not be visible
      expect(screen.queryByText("Invalid code")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    test("should have proper label associations", () => {
      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      const label = screen.getByText("Verification Code");

      expect(input).toHaveAttribute("id", "code");
      expect(label.tagName).toBe("LABEL");
    });

    test("should have required attribute on input", () => {
      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      expect(input).toHaveAttribute("required");
    });

    test("should have proper input type for mobile keyboards", () => {
      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      expect(input).toHaveAttribute("inputMode", "numeric");
    });

    test("should have proper input type attribute", () => {
      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      expect(input).toHaveAttribute("type", "text");
    });

    test("should have descriptive error messages with aria-describedby", () => {
      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      fireEvent.click(submitButton);

      expect(input).toHaveAttribute("aria-describedby", "code-error");
    });

    test("should have semantic heading structure", () => {
      render(<VerificationForm />);

      const heading = screen.getByText("Verify your email");
      expect(heading.tagName).toBe("H1");
    });
  });

  describe("Edge Cases", () => {
    test("should handle rapid successive submissions", async () => {
      (verificationController.verifyRegistration as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      fireEvent.change(input, { target: { value: "123456" } });
      fireEvent.click(submitButton);
      fireEvent.click(submitButton); // Click again immediately

      await waitFor(() => {
        expect(verificationController.verifyRegistration).toHaveBeenCalled();
      });
    });

    test("should handle rapid resend attempts", async () => {
      (verificationController.resendVerificationCode as jest.Mock).mockResolvedValue({
        success: true,
      });

      render(<VerificationForm />);

      const resendButton = screen.getByRole("button", { name: /Resend Code/i });

      fireEvent.click(resendButton);
      fireEvent.click(resendButton); // Click again immediately

      await waitFor(() => {
        expect(verificationController.resendVerificationCode).toHaveBeenCalled();
      });
    });

    test("should handle empty success response", async () => {
      (verificationController.verifyRegistration as jest.Mock).mockResolvedValue({
        success: false,
        error: "",
      });

      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      fireEvent.change(input, { target: { value: "123456" } });

      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      // Should not crash and handle gracefully
      expect(screen.queryByText(/Email verified/)).not.toBeInTheDocument();
    });

    test("should handle very long error messages", async () => {
      const longError = "A".repeat(500);
      (verificationController.verifyRegistration as jest.Mock).mockResolvedValue({
        success: false,
        error: longError,
      });

      render(<VerificationForm />);

      const input = screen.getByPlaceholderText("000000");
      fireEvent.change(input, { target: { value: "123456" } });

      const submitButton = screen.getByRole("button", { name: /Verify Code/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(longError)).toBeInTheDocument();
      });
    });
  });

  describe("Search Params Edge Cases", () => {
    test("should handle missing email gracefully", () => {
      mockSearchParams.get.mockReturnValue(null);

      render(<VerificationForm />);

      const description = screen.getByText(/We sent a 6-digit code to/i);
      expect(description).toBeInTheDocument();
    });

    test("should handle email with special characters", () => {
      mockSearchParams.get.mockReturnValue("test+tag@example.co.uk");

      render(<VerificationForm />);

      expect(screen.getByText(/test\+tag@example\.co\.uk/)).toBeInTheDocument();
    });

    test("should update email display when search params change", () => {
      const { rerender } = render(<VerificationForm />);

      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();

      mockSearchParams.get.mockReturnValue("newemail@example.com");
      rerender(<VerificationForm />);

      expect(screen.getByText(/newemail@example.com/)).toBeInTheDocument();
    });
  });
});
