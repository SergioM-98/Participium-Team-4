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
      where: { telegramToken: token },
    });
    if (!user) {
      return {
        success: false,
        error: "No user found with the provided telegram token.",
      };
    }

    if (user.telegramRequestPending === false) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          telegramToken: null,
          telegramRequestPending: false,
          telegramRequestTTL: null,
        },
      });
      return {
        success: false,
        error: "No pending telegram registration request for this user.",
      };
    }

    if(user.telegramRequestTTL && user.telegramRequestTTL < (new Date())){
      await prisma.user.update({
        where: { id: user.id },
        data: {
          telegramToken: null,
          telegramRequestPending: false,
          telegramRequestTTL: null,
        },
      });
      return {
        success: false,
        error: "The last telegram registration request has expired. Please start the registration process again.",
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        telegramChatId: telegramId.toString(),
        telegramToken: null,
        telegramRequestPending: false,
        telegramRequestTTL: null,
      },
    });

    if (!updatedUser) {
      throw new Error("Failed to update user with telegram ID.");
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if(!user){
      throw new Error("User not found");
    }
    if(user.role !== "CITIZEN"){
      throw new Error("Only citizens can register telegram accounts");
    }
    if(user.telegramRequestPending){
      if(user.telegramRequestTTL && user.telegramRequestTTL > (new Date())){
        throw new Error("There is already a pending telegram registration request. Please complete it before starting a new one.");
      }
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        telegramToken: token,
        telegramRequestPending: true,
        telegramRequestTTL: new Date(Date.now() + 5 * 60 * 1000), // 15 minutes from now
      },
    });
    if (!updatedUser) {
      throw new Error("Failed to start telegram registration.");
    }
    return {
      success: true,
      data: token,
    };
  }

  async isAuthenticated(chatId: number): Promise<UserAuthenticationResponse> {
    console.log("Searching for user with telegram chatId:", chatId.toString());

    const user = await prisma.user.findUnique({
      where: { telegramChatId: chatId.toString() },
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
      if(user.telegramRequestTTL && user.telegramRequestTTL < (new Date())){
        await prisma.user.update({
          where: { id: user.id },
          data: {
            telegramToken: null,
            telegramRequestPending: false,
            telegramRequestTTL: null,
          },
        });
        return {
          success: false,
          error: "The previous telegram registration request has expired. Please start the registration process again.",
        };
      }else{
        return {
          success: false,
          error: "Telegram registration is still pending.",
        };
      }
    }

    return {
      success: true,
      data: user.username,
    };
  }
}

export { TelegramBotRepository };
