import {
  verifyRegistration,
  resendVerificationCode,
} from "../../../src/app/lib/controllers/verification.controller";
import { VerificationService } from "../../../src/app/lib/services/verification.service";

const mockVerificationService = {
  verifyRegistration: jest.fn(),
  resendVerificationCode: jest.fn(),
};

jest.mock("@/app/lib/services/verification.service", () => {
  return {
    VerificationService: {
      getInstance: jest.fn(),
    },
  };
});

describe("VerificationController - Story PT27", () => {
  beforeEach(() => {
    (VerificationService.getInstance as jest.Mock).mockReturnValue(
      mockVerificationService,
    );
    jest.clearAllMocks();
  });

  describe("verifyRegistration", () => {
    it("should verify registration successfully with valid code", async () => {
      mockVerificationService.verifyRegistration.mockResolvedValue({
        success: true,
        data: "User verified successfully",
      });

      const result = await verifyRegistration("test@example.com", "123456");

      expect(result.success).toBe(true);
      expect(mockVerificationService.verifyRegistration).toHaveBeenCalledWith(
        "test@example.com",
        "123456",
      );
    });

    it("should return error if verification code is not provided", async () => {
      const result = await verifyRegistration("test@example.com", "");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Verification code is required");
      expect(mockVerificationService.verifyRegistration).not.toHaveBeenCalled();
    });

    it("should trim email and code before processing", async () => {
      mockVerificationService.verifyRegistration.mockResolvedValue({
        success: true,
        data: "User verified successfully",
      });

      await verifyRegistration("  test@example.com  ", "  123456  ");

      expect(mockVerificationService.verifyRegistration).toHaveBeenCalledWith(
        "test@example.com",
        "123456",
      );
    });

    it("should handle invalid verification code error", async () => {
      mockVerificationService.verifyRegistration.mockResolvedValue({
        success: false,
        error: "Invalid verification code",
      });

      const result = await verifyRegistration("test@example.com", "wrong-code");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid verification code");
    });

    it("should handle expired verification code error", async () => {
      mockVerificationService.verifyRegistration.mockResolvedValue({
        success: false,
        error: "Verification code has expired. Please register again.",
      });

      const result = await verifyRegistration("test@example.com", "123456");

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Verification code has expired. Please register again.",
      );
    });

    it("should handle user already verified error", async () => {
      mockVerificationService.verifyRegistration.mockResolvedValue({
        success: false,
        error: "User is already verified",
      });

      const result = await verifyRegistration("test@example.com", "123456");

      expect(result.success).toBe(false);
      expect(result.error).toBe("User is already verified");
    });

    it("should handle user not found error", async () => {
      mockVerificationService.verifyRegistration.mockResolvedValue({
        success: false,
        error: "User not found",
      });

      const result = await verifyRegistration(
        "nonexistent@example.com",
        "123456",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("User not found");
    });
  });

  describe("resendVerificationCode", () => {
    it("should resend verification code successfully", async () => {
      mockVerificationService.resendVerificationCode.mockResolvedValue({
        success: true,
        data: "Verification code resent successfully",
      });

      const result = await resendVerificationCode("test@example.com");

      expect(result.success).toBe(true);
      expect(
        mockVerificationService.resendVerificationCode,
      ).toHaveBeenCalledWith("test@example.com");
    });

    it("should return error if email is not provided", async () => {
      const result = await resendVerificationCode("");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Email is required");
      expect(
        mockVerificationService.resendVerificationCode,
      ).not.toHaveBeenCalled();
    });

    it("should trim email before processing", async () => {
      mockVerificationService.resendVerificationCode.mockResolvedValue({
        success: true,
        data: "Verification code resent successfully",
      });

      await resendVerificationCode("  test@example.com  ");

      expect(
        mockVerificationService.resendVerificationCode,
      ).toHaveBeenCalledWith("test@example.com");
    });

    it("should handle user not found error", async () => {
      mockVerificationService.resendVerificationCode.mockResolvedValue({
        success: false,
        error: "User not found",
      });

      const result = await resendVerificationCode("nonexistent@example.com");

      expect(result.success).toBe(false);
      expect(result.error).toBe("User not found");
    });

    it("should handle user already verified error", async () => {
      mockVerificationService.resendVerificationCode.mockResolvedValue({
        success: false,
        error: "User is already verified",
      });

      const result = await resendVerificationCode("test@example.com");

      expect(result.success).toBe(false);
      expect(result.error).toBe("User is already verified");
    });

    it("should handle rate limit error (too soon to resend)", async () => {
      mockVerificationService.resendVerificationCode.mockResolvedValue({
        success: false,
        error: "Please wait 30 seconds before requesting a new code",
      });

      const result = await resendVerificationCode("test@example.com");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Please wait");
      expect(result.error).toContain("seconds before requesting a new code");
    });

    it("should handle service errors gracefully", async () => {
      mockVerificationService.resendVerificationCode.mockResolvedValue({
        success: false,
        error: "Failed to resend verification code. Please try again.",
      });

      const result = await resendVerificationCode("test@example.com");

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Failed to resend verification code. Please try again.",
      );
    });
  });
});
