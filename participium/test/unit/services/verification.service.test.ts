import { VerificationService } from "../../../src/app/lib/services/verification.service";
import { VerificationRepository } from "../../../src/app/lib/repositories/verification.repository";
import { EmailService } from "../../../src/app/lib/services/email.service";

const mockVerificationRepository = {
  createVerificationToken: jest.fn(),
  findUserByEmail: jest.fn(),
  findLatestVerificationToken: jest.fn(),
  findVerificationToken: jest.fn(),
  verifyUserAndMarkToken: jest.fn(),
  findExpiredTokenUsers: jest.fn(),
  deleteUnverifiedUsers: jest.fn(),
};

const mockEmailService = {
  sendVerificationEmail: jest.fn(),
};

jest.mock("@/app/lib/repositories/verification.repository", () => {
  return {
    VerificationRepository: {
      getInstance: jest.fn(),
    },
  };
});

jest.mock("@/app/lib/services/email.service", () => {
  return {
    EmailService: {
      getInstance: jest.fn(),
    },
  };
});

jest.mock("@/app/lib/utils/verification.utils", () => ({
  generateVerificationCode: jest.fn(() => "123456"),
  getVerificationTokenExpiry: jest.fn(
    () => new Date(Date.now() + 30 * 60 * 1000),
  ),
  isTokenExpired: jest.fn((expiresAt: Date) => new Date() > expiresAt),
}));

describe("VerificationService - Story PT27", () => {
  let verificationService: VerificationService;

  beforeEach(() => {
    (VerificationRepository.getInstance as jest.Mock).mockReturnValue(
      mockVerificationRepository,
    );
    (EmailService.getInstance as jest.Mock).mockReturnValue(mockEmailService);
    verificationService = VerificationService.getInstance();
    jest.clearAllMocks();
  });

  describe("createAndSendVerificationToken", () => {
    it("should create verification token and send email successfully", async () => {
      mockVerificationRepository.createVerificationToken.mockResolvedValue({
        success: true,
      });
      mockEmailService.sendVerificationEmail.mockResolvedValue({
        success: true,
      });

      const result = await verificationService.createAndSendVerificationToken(
        "user-123",
        "test@example.com",
        "John",
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe("Verification email sent");
      expect(
        mockVerificationRepository.createVerificationToken,
      ).toHaveBeenCalled();
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        "test@example.com",
        "123456",
        "John",
      );
    });

    it("should handle errors when sending verification email fails", async () => {
      mockVerificationRepository.createVerificationToken.mockResolvedValue({
        success: true,
      });
      mockEmailService.sendVerificationEmail.mockRejectedValue(
        new Error("Email service error"),
      );

      const result = await verificationService.createAndSendVerificationToken(
        "user-123",
        "test@example.com",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Failed to send verification email. Please try again.",
      );
    });

    it("should handle errors when creating verification token fails", async () => {
      mockVerificationRepository.createVerificationToken.mockRejectedValue(
        new Error("Database error"),
      );

      const result = await verificationService.createAndSendVerificationToken(
        "user-123",
        "test@example.com",
        "John",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Failed to send verification email. Please try again.",
      );
      expect(mockEmailService.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it("should create verification token without firstName", async () => {
      mockVerificationRepository.createVerificationToken.mockResolvedValue({
        success: true,
      });
      mockEmailService.sendVerificationEmail.mockResolvedValue({
        success: true,
      });

      const result = await verificationService.createAndSendVerificationToken(
        "user-123",
        "test@example.com",
      );

      expect(result.success).toBe(true);
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        "test@example.com",
        "123456",
        undefined,
      );
    });
  });

  describe("verifyRegistration", () => {
    it("should verify user registration successfully with valid code", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        isVerified: false,
        firstName: "John",
      };

      const mockToken = {
        id: "token-123",
        userId: "user-123",
        code: "123456",
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        createdAt: new Date(),
      };

      mockVerificationRepository.findUserByEmail.mockResolvedValue(mockUser);
      mockVerificationRepository.findVerificationToken.mockResolvedValue(
        mockToken,
      );
      mockVerificationRepository.verifyUserAndMarkToken.mockResolvedValue({
        success: true,
      });

      const result = await verificationService.verifyRegistration(
        "test@example.com",
        "123456",
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe("User verified successfully");
      expect(
        mockVerificationRepository.verifyUserAndMarkToken,
      ).toHaveBeenCalledWith("user-123", "token-123");
    });

    it("should return error if user not found", async () => {
      mockVerificationRepository.findUserByEmail.mockResolvedValue(null);

      const result = await verificationService.verifyRegistration(
        "nonexistent@example.com",
        "123456",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("User not found");
    });

    it("should return error if user is already verified", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        isVerified: true,
      };

      mockVerificationRepository.findUserByEmail.mockResolvedValue(mockUser);

      const result = await verificationService.verifyRegistration(
        "test@example.com",
        "123456",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("User is already verified");
    });

    it("should return error if verification code is invalid", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        isVerified: false,
      };

      mockVerificationRepository.findUserByEmail.mockResolvedValue(mockUser);
      mockVerificationRepository.findVerificationToken.mockResolvedValue(null);

      const result = await verificationService.verifyRegistration(
        "test@example.com",
        "wrong-code",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid verification code");
    });

    it("should return error if verification code is expired", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        isVerified: false,
      };

      const mockToken = {
        id: "token-123",
        userId: "user-123",
        code: "123456",
        expiresAt: new Date(Date.now() - 60 * 60 * 1000), // expired 1 hour ago
        createdAt: new Date(Date.now() - 90 * 60 * 1000),
      };

      mockVerificationRepository.findUserByEmail.mockResolvedValue(mockUser);
      mockVerificationRepository.findVerificationToken.mockResolvedValue(
        mockToken,
      );
      mockVerificationRepository.findExpiredTokenUsers.mockResolvedValue([]);

      const result = await verificationService.verifyRegistration(
        "test@example.com",
        "123456",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Verification code has expired. Please register again.",
      );
    });

    it("should handle error when verifyUserAndMarkToken fails", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        isVerified: false,
      };

      const mockToken = {
        id: "token-123",
        userId: "user-123",
        code: "123456",
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        createdAt: new Date(),
      };

      mockVerificationRepository.findUserByEmail.mockResolvedValue(mockUser);
      mockVerificationRepository.findVerificationToken.mockResolvedValue(
        mockToken,
      );
      mockVerificationRepository.verifyUserAndMarkToken.mockRejectedValue(
        new Error("Transaction failed"),
      );

      const result = await verificationService.verifyRegistration(
        "test@example.com",
        "123456",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Verification failed. Please try again.");
    });
  });

  describe("resendVerificationCode", () => {
    it("should resend verification code successfully", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        isVerified: false,
        firstName: "John",
      };

      const oldToken = {
        id: "old-token",
        userId: "user-123",
        code: "old-code",
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      };

      mockVerificationRepository.findUserByEmail.mockResolvedValue(mockUser);
      mockVerificationRepository.findLatestVerificationToken.mockResolvedValue(
        oldToken,
      );
      mockVerificationRepository.createVerificationToken.mockResolvedValue({
        success: true,
      });
      mockEmailService.sendVerificationEmail.mockResolvedValue({
        success: true,
      });

      const result =
        await verificationService.resendVerificationCode("test@example.com");

      expect(result.success).toBe(true);
      expect(result.data).toBe("Verification code resent successfully");
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        "test@example.com",
        "123456",
        "John",
      );
    });

    it("should return error if user not found", async () => {
      mockVerificationRepository.findUserByEmail.mockResolvedValue(null);

      const result = await verificationService.resendVerificationCode(
        "nonexistent@example.com",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("User not found");
    });

    it("should return error if user is already verified", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        isVerified: true,
      };

      mockVerificationRepository.findUserByEmail.mockResolvedValue(mockUser);

      const result =
        await verificationService.resendVerificationCode("test@example.com");

      expect(result.success).toBe(false);
      expect(result.error).toBe("User is already verified");
    });

    it("should return error if trying to resend within 1 minute", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        isVerified: false,
        firstName: "John",
      };

      const recentToken = {
        id: "recent-token",
        userId: "user-123",
        code: "recent-code",
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        createdAt: new Date(Date.now() - 30 * 1000), // 30 seconds ago
      };

      mockVerificationRepository.findUserByEmail.mockResolvedValue(mockUser);
      mockVerificationRepository.findLatestVerificationToken.mockResolvedValue(
        recentToken,
      );

      const result =
        await verificationService.resendVerificationCode("test@example.com");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Please wait");
      expect(result.error).toContain("seconds before requesting a new code");
    });

    it("should allow resend when no previous token exists", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        isVerified: false,
        firstName: "John",
      };

      mockVerificationRepository.findUserByEmail.mockResolvedValue(mockUser);
      mockVerificationRepository.findLatestVerificationToken.mockResolvedValue(
        null,
      );
      mockVerificationRepository.createVerificationToken.mockResolvedValue({
        success: true,
      });
      mockEmailService.sendVerificationEmail.mockResolvedValue({
        success: true,
      });

      const result =
        await verificationService.resendVerificationCode("test@example.com");

      expect(result.success).toBe(true);
      expect(result.data).toBe("Verification code resent successfully");
      expect(
        mockVerificationRepository.createVerificationToken,
      ).toHaveBeenCalled();
    });

    it("should handle error when creating new token fails during resend", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        isVerified: false,
        firstName: "John",
      };

      const oldToken = {
        id: "old-token",
        userId: "user-123",
        code: "old-code",
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 60 * 1000),
      };

      mockVerificationRepository.findUserByEmail.mockResolvedValue(mockUser);
      mockVerificationRepository.findLatestVerificationToken.mockResolvedValue(
        oldToken,
      );
      mockVerificationRepository.createVerificationToken.mockRejectedValue(
        new Error("Database error"),
      );

      const result =
        await verificationService.resendVerificationCode("test@example.com");

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Failed to resend verification code. Please try again.",
      );
    });

    it("should handle error when sending email fails during resend", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        isVerified: false,
        firstName: "John",
      };

      const oldToken = {
        id: "old-token",
        userId: "user-123",
        code: "old-code",
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 60 * 1000),
      };

      mockVerificationRepository.findUserByEmail.mockResolvedValue(mockUser);
      mockVerificationRepository.findLatestVerificationToken.mockResolvedValue(
        oldToken,
      );
      mockVerificationRepository.createVerificationToken.mockResolvedValue({
        success: true,
      });
      mockEmailService.sendVerificationEmail.mockRejectedValue(
        new Error("Email service error"),
      );

      const result =
        await verificationService.resendVerificationCode("test@example.com");

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Failed to resend verification code. Please try again.",
      );
    });

    it("should allow resend when token is expired but user tries again", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        isVerified: false,
        firstName: "John",
      };

      const expiredToken = {
        id: "expired-token",
        userId: "user-123",
        code: "expired-code",
        expiresAt: new Date(Date.now() - 60 * 60 * 1000), // expired 1 hour ago
        createdAt: new Date(Date.now() - 90 * 60 * 1000),
      };

      mockVerificationRepository.findUserByEmail.mockResolvedValue(mockUser);
      mockVerificationRepository.findLatestVerificationToken.mockResolvedValue(
        expiredToken,
      );
      mockVerificationRepository.createVerificationToken.mockResolvedValue({
        success: true,
      });
      mockEmailService.sendVerificationEmail.mockResolvedValue({
        success: true,
      });

      const result =
        await verificationService.resendVerificationCode("test@example.com");

      expect(result.success).toBe(true);
      expect(result.data).toBe("Verification code resent successfully");
    });
  });

  describe("cleanupExpiredTokens", () => {
    it("should cleanup expired tokens and delete unverified users", async () => {
      const expiredTokenUsers = [
        { userId: "user-1", id: "token-1" },
        { userId: "user-2", id: "token-2" },
      ];

      mockVerificationRepository.findExpiredTokenUsers.mockResolvedValue(
        expiredTokenUsers,
      );
      mockVerificationRepository.deleteUnverifiedUsers.mockResolvedValue({
        success: true,
      });

      await verificationService.cleanupExpiredTokens();

      expect(
        mockVerificationRepository.findExpiredTokenUsers,
      ).toHaveBeenCalled();
      expect(
        mockVerificationRepository.deleteUnverifiedUsers,
      ).toHaveBeenCalledWith(["user-1", "user-2"]);
    });

    it("should not delete users if no expired tokens found", async () => {
      mockVerificationRepository.findExpiredTokenUsers.mockResolvedValue([]);

      await verificationService.cleanupExpiredTokens();

      expect(
        mockVerificationRepository.findExpiredTokenUsers,
      ).toHaveBeenCalled();
      expect(
        mockVerificationRepository.deleteUnverifiedUsers,
      ).not.toHaveBeenCalled();
    });

    it("should handle error when finding expired tokens fails", async () => {
      mockVerificationRepository.findExpiredTokenUsers.mockRejectedValue(
        new Error("Database error"),
      );

      await verificationService.cleanupExpiredTokens();

      expect(
        mockVerificationRepository.findExpiredTokenUsers,
      ).toHaveBeenCalled();
      expect(
        mockVerificationRepository.deleteUnverifiedUsers,
      ).not.toHaveBeenCalled();
    });

    it("should handle error when deleting expired users fails", async () => {
      const expiredTokenUsers = [{ userId: "user-1", id: "token-1" }];

      mockVerificationRepository.findExpiredTokenUsers.mockResolvedValue(
        expiredTokenUsers,
      );
      mockVerificationRepository.deleteUnverifiedUsers.mockRejectedValue(
        new Error("Delete failed"),
      );

      await verificationService.cleanupExpiredTokens();

      expect(
        mockVerificationRepository.deleteUnverifiedUsers,
      ).toHaveBeenCalledWith(["user-1"]);
    });
  });
});
