import {
  generateVerificationCode,
  getVerificationTokenExpiry,
  isTokenExpired,
} from "@/utils/verification.utils";
import { VerificationResponse } from "@/dtos/verification.dto";
import { VerificationRepository } from "@/repositories/verification.repository";
import { UserRepository } from "@/repositories/user.repository";
import { EmailService } from "@/services/email.service";

class VerificationService {
  private static instance: VerificationService;
  private verificationRepository: VerificationRepository;
  private userRepository: UserRepository;
  private emailService: EmailService;

  private constructor() {
    this.verificationRepository = VerificationRepository.getInstance();
    this.userRepository = UserRepository.getInstance();
    this.emailService = EmailService.getInstance();
  }

  public static getInstance(): VerificationService {
    if (!VerificationService.instance) {
      VerificationService.instance = new VerificationService();
    }
    return VerificationService.instance;
  }

  public async createAndSendVerificationToken(
    userId: string,
    email: string,
    firstName?: string,
  ): Promise<VerificationResponse> {
    try {
      const code = generateVerificationCode();
      const expiresAt = getVerificationTokenExpiry();

      await this.verificationRepository.createVerificationToken(
        userId,
        code,
        expiresAt,
      );

      await this.emailService.sendVerificationEmail(email, code, firstName);

      return { success: true, data: "Verification email sent" };
    } catch (error) {
      console.error("Failed to create and send verification token:", error);
      return {
        success: false,
        error: "Failed to send verification email. Please try again.",
      };
    }
  }

  public async verifyRegistration(
    email: string,
    code: string,
  ): Promise<VerificationResponse> {
    try {
      const user = await this.verificationRepository.findUserByEmail(email);

      if (!user) {
        return { success: false, error: "User not found" };
      }

      if (user.isVerified === true) {
        return { success: false, error: "User is already verified" };
      }

      const token = await this.verificationRepository.findVerificationToken(
        user.id,
        code,
      );

      if (!token) {
        return { success: false, error: "Invalid verification code" };
      }

      if (isTokenExpired(token.expiresAt)) {
        this.cleanupExpiredTokens();

        return {
          success: false,
          error: "Verification code has expired. Please register again.",
        };
      }

      await this.verificationRepository.verifyUserAndMarkToken(
        user.id,
        token.id,
      );

      return { success: true, data: "User verified successfully" };
    } catch (error) {
      console.error("Verification failed:", error);
      return {
        success: false,
        error: "Verification failed. Please try again.",
      };
    }
  }

  public async cleanupExpiredTokens(): Promise<void> {
    try {
      const expiredTokens =
        await this.verificationRepository.findExpiredTokenUsers();
      const userIdsToDelete = expiredTokens.map((t) => t.userId);

      if (userIdsToDelete.length > 0) {
        await this.verificationRepository.deleteUnverifiedUsers(
          userIdsToDelete,
        );
      }
    } catch (error) {
      console.error("Failed to cleanup expired tokens:", error);
    }
  }
}

export { VerificationService };
