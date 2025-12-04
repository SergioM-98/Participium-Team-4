import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/prisma/db";
import { RegistrationInput, RegistrationResponse } from "@/dtos/user.dto";
import { NotificationsRepository } from "@/repositories/notifications.repository";
import { UserRepository } from "@/repositories/user.repository";
import { VerificationService } from "@/services/verification.service";

type DBClient = PrismaClient | Prisma.TransactionClient;

class UserService {
  private static instance: UserService;
  private readonly userRepository: UserRepository;
  private readonly notificationsRepository: NotificationsRepository;
  private readonly verificationService: VerificationService;

  private constructor() {
    this.userRepository = UserRepository.getInstance();
    this.notificationsRepository = NotificationsRepository.getInstance();
    this.verificationService = VerificationService.getInstance();
  }
  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  public async checkDuplicates(userData: RegistrationInput) {
    return this.userRepository.checkDuplicates(userData);
  }

  public async createUser(
    userData: RegistrationInput,
  ): Promise<RegistrationResponse> {
    return await prisma.$transaction(async (tx) => {
      const result = await this.userRepository.createUser(userData, tx);
      if (!result.success) return result;

      if (userData.role === "CITIZEN") {
        // Set up notification preferences
        const res =
          await this.notificationsRepository.updateNotificationsPreferences(
            userData.id,
            {
              emailEnabled: true,
              telegramEnabled: false,
            },
            tx,
          );

        if (!res.success) {
          throw new Error(res.error);
        }
      

        if (!userData.email) {
          throw new Error("Email is required for CITIZEN users");
        }

        // Send verification email
        const verificationResult =
          await this.verificationService.createAndSendVerificationToken(
            userData.id,
            userData.email,
            userData.firstName,
          );

        console.log("Verification Result:", verificationResult);

        if (!verificationResult.success) {
          throw new Error(
            verificationResult.error || "Failed to send verification email",
          );
        }
      }
      return result;
    });
  }

  public async retrieveUser(userData: { username: string; password: string }) {
    return this.userRepository.retrieveUser(userData);
  }

  public async updateNotificationsMedia(

    userId: string,
    email: string | null,
    removeTelegram: boolean,
    db: DBClient = prisma
  ) {
    return this.userRepository.updateNotificationsMedia(
      userId,
      email,
      removeTelegram,
      db
    );
  }

  public async getUserByTelegramId(
    telegramId: string,
  ): Promise<RegistrationResponse> {
    return this.userRepository.getUserByTelegramId(telegramId);
  }

  public async getMe(userId:string){
    return this.userRepository.getUserById(userId);
  }


  public async getUserWithCompany(userId: string) {
    return this.userRepository.getUserWithCompany(userId);
  }
}

export { UserService };
