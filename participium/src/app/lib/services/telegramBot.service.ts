import { RegistrationResponse } from "../dtos/user.dto";
import { TelegramBotRepository } from "../repositories/telegramBot.repository";
import { UserAuthenticationResponse } from "../dtos/telegramBot.dto";

class TelegramService {
  private static instance: TelegramService;
  private telegramRepository: TelegramBotRepository;
  private constructor() {
    this.telegramRepository = TelegramBotRepository.getInstance();
  }
  public static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  public async registerTelegram(
    token: string,
    telegramId: number
  ): Promise<RegistrationResponse> {
    const response = await this.telegramRepository.registerTelegram(
      token,
      telegramId
    );
    return response;
  }

  public async startTelegramRegistration(
    userId: string,
    token: string
  ): Promise<RegistrationResponse> {
    const response = await this.telegramRepository.startTelegramRegistration(
      userId,
      token
    );
    return response;
  }

  public async isAuthenticated(
    chatId: number
  ): Promise<UserAuthenticationResponse> {
    const response = await this.telegramRepository.isAuthenticated(chatId);
    return response;
  }
}

export { TelegramService };
