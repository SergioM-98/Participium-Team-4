import { TelegramService } from "@/services/telegramBot.service";
import { TelegramBotRepository } from "@/repositories/telegramBot.repository";

describe("TelegramService - Story 12", () => {
  const mockRepo = {
    registerTelegram: jest.fn(),
    startTelegramRegistration: jest.fn(),
    isAuthenticated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(TelegramBotRepository, "getInstance").mockReturnValue(mockRepo);
  });

  it("should register telegram successfully", async () => {
    mockRepo.registerTelegram.mockResolvedValue({ success: true });
    const service = TelegramService.getInstance();
    const result = await service.registerTelegram("token", 12345);
    expect(result.success).toBe(true);
    expect(mockRepo.registerTelegram).toHaveBeenCalledWith("token", 12345);
  });

  it("should start telegram registration", async () => {
    mockRepo.startTelegramRegistration.mockResolvedValue({ success: true });
    const service = TelegramService.getInstance();
    const result = await service.startTelegramRegistration("userId", "token");
    expect(result.success).toBe(true);
    expect(mockRepo.startTelegramRegistration).toHaveBeenCalledWith("userId", "token");
  });

  it("should check telegram authentication", async () => {
    mockRepo.isAuthenticated.mockResolvedValue({ authenticated: true });
    const service = TelegramService.getInstance();
    const result = await service.isAuthenticated(12345);
    expect(result.authenticated).toBe(true);
    expect(mockRepo.isAuthenticated).toHaveBeenCalledWith(12345);
  });
});
