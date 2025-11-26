import { ReportRegistrationResponse } from "../dtos/report.dto";
import { prisma } from "../../../../prisma/db";
import { UserAuthenticationResponse } from "../dtos/telegramBot.dto";

class TelegramBotRepository {
  private static instance: TelegramBotRepository;

  private constructor() {}

  public static getInstance(): TelegramBotRepository {
    if (!TelegramBotRepository.instance) {
      TelegramBotRepository.instance = new TelegramBotRepository();
    }
    return TelegramBotRepository.instance;
  }

  async registerTelegram(
    token: string,
    telegramId: number
  ): Promise<ReportRegistrationResponse> {
    const user = await prisma.user.findUnique({
      where: { telegram: token },
    });

    if (!user) {
      return {
        success: false,
        error: "No user found with the provided telegram token.",
      };
    }

    if (user.telegramRequestPending === false) {
      return {
        success: false,
        error: "No pending telegram registration request for this user.",
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        telegram: telegramId.toString(),
        telegramRequestPending: false,
      },
    });

    if (!updatedUser) {
      return {
        success: false,
        error: "Failed to update user with telegram ID.",
      };
    }

    return {
      success: true,
      data: "Telegram registered successfully.",
    };
  }

  async startTelegramRegistration(
    userId: string,
    token: string
  ): Promise<ReportRegistrationResponse> {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        telegram: token,
        telegramRequestPending: true,
      },
    });
    if (!updatedUser) {
      return {
        success: false,
        error: "Failed to start telegram registration.",
      };
    }
    return {
      success: true,
      data: token,
    };
  }

  async isAuthenticated(chatId: number): Promise<UserAuthenticationResponse> {
    console.log("Searching for user with telegram chatId:", chatId.toString());

    const user = await prisma.user.findUnique({
      where: { telegram: chatId.toString() },
    });

    console.log(
      "User found:",
      user
        ? `Yes (username: ${user.username}, pending: ${user.telegramRequestPending})`
        : "No"
    );

    if (!user) {
      return {
        success: false,
        error: "User not authenticated with this Telegram account.",
      };
    }

    if (user.telegramRequestPending) {
      return {
        success: false,
        error: "Telegram registration is still pending.",
      };
    }

    return {
      success: true,
      data: user.username,
    };
  }
}

export { TelegramBotRepository };
