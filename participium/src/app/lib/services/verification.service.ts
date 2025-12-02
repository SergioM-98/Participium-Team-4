import { prisma } from "../../../../prisma/db";
import {
  generateVerificationCode,
  getVerificationTokenExpiry,
  isTokenExpired,
} from "../utils/verification.utils";
import { sendVerificationEmail } from "../utils/email.utils";

interface VerificationResponse {
  success: boolean;
  error?: string;
}

class VerificationService {
  private static instance: VerificationService;

  private constructor() {}

  public static getInstance(): VerificationService {
    if (!VerificationService.instance) {
      VerificationService.instance = new VerificationService();
    }
    return VerificationService.instance;
  }

  /**
   * Create a verification token for a user and send verification email
   */
  public async createAndSendVerificationToken(
    userId: string,
    email: string,
    firstName?: string
  ): Promise<VerificationResponse> {
    try {
      const code = generateVerificationCode();
      const expiresAt = getVerificationTokenExpiry();

      await prisma.verificationToken.create({
        data: {
          userId,
          code,
          expiresAt,
        },
      });

      await sendVerificationEmail(email, code, firstName);

      return { success: true };
    } catch (error) {
      console.error("Failed to create and send verification token:", error);
      return {
        success: false,
        error: "Failed to send verification email. Please try again.",
      };
    }
  }

  /**
   * Verify a user with the provided code
   */
  public async verifyRegistration(
    emailOrUsername: string,
    code: string
  ): Promise<VerificationResponse> {
    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
        },
      });

      if (!user) {
        return { success: false, error: "User not found" };
      }

      if (user.isVerified === true) {
        return { success: false, error: "User is already verified" };
      }

      const token = await prisma.verificationToken.findFirst({
        where: {
          userId: user.id,
          code,
          used: false,
        },
      });

      if (!token) {
        return { success: false, error: "Invalid verification code" };
      }

      if (isTokenExpired(token.expiresAt)) {
        // Cleanup: delete expired token and unverified user
        await prisma.verificationToken.deleteMany({
          where: { userId: user.id },
        });
        await prisma.user.delete({
          where: { id: user.id },
        });

        return {
          success: false,
          error: "Verification code has expired. Please register again.",
        };
      }

      // Mark token as used and verify user
      await prisma.$transaction(async (tx) => {
        await tx.verificationToken.update({
          where: { id: token.id },
          data: { used: true },
        });

        await tx.user.update({
          where: { id: user.id },
          data: { isVerified: true },
        });
      });

      return { success: true };
    } catch (error) {
      console.error("Verification failed:", error);
      return {
        success: false,
        error: "Verification failed. Please try again.",
      };
    }
  }

  /**
   * Clean up expired tokens and unverified users (optional: can be called periodically)
   */
  public async cleanupExpiredTokens(): Promise<void> {
    try {
      const now = new Date();

      // Find and delete unverified users with expired tokens
      const expiredTokens = await prisma.verificationToken.findMany({
        where: {
          expiresAt: { lt: now },
          used: false,
        },
        select: { userId: true },
        distinct: ["userId"],
      });

      const userIdsToDelete = expiredTokens.map((t) => t.userId);

      if (userIdsToDelete.length > 0) {
        await prisma.user.deleteMany({
          where: {
            id: { in: userIdsToDelete },
            isVerified: false,
          },
        });
      }
    } catch (error) {
      console.error("Failed to cleanup expired tokens:", error);
    }
  }
}

export { VerificationService };
export type { VerificationResponse };
