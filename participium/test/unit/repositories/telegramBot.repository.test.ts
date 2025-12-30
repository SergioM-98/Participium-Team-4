import { TelegramBotRepository } from "@/repositories/telegramBot.repository";
import { prisma } from "@/prisma/db";

jest.mock("@/prisma/db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("TelegramBotRepository", () => {
  let repository: TelegramBotRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = TelegramBotRepository.getInstance();
  });

  describe("getInstance", () => {
    it("should return the same instance (singleton pattern)", () => {
      const instance1 = TelegramBotRepository.getInstance();
      const instance2 = TelegramBotRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("registerTelegram", () => {
    const mockToken = "test-token-123";
    const mockTelegramId = 123456789;

    it("should register telegram successfully for valid token", async () => {
      const mockUser = {
        id: "user-1",
        telegramToken: mockToken,
        telegramRequestPending: true,
        telegramRequestTTL: new Date(Date.now() + 10 * 60 * 1000),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        telegramChatId: mockTelegramId.toString(),
        telegramToken: null,
        telegramRequestPending: false,
        telegramRequestTTL: null,
      });

      const result = await repository.registerTelegram(mockToken, mockTelegramId);

      expect(result).toEqual({
        success: true,
        data: "Telegram registered successfully.",
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { telegramToken: mockToken },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: {
          telegramChatId: mockTelegramId.toString(),
          telegramToken: null,
          telegramRequestPending: false,
          telegramRequestTTL: null,
        },
      });
    });

    it("should return error when user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.registerTelegram(mockToken, mockTelegramId);

      expect(result).toEqual({
        success: false,
        error: "No user found with the provided telegram token.",
      });
    });

    it("should return error when no pending registration", async () => {
      const mockUser = {
        id: "user-1",
        telegramToken: mockToken,
        telegramRequestPending: false,
        telegramRequestTTL: null,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.registerTelegram(mockToken, mockTelegramId);

      expect(result).toEqual({
        success: false,
        error: "No pending telegram registration request for this user.",
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: {
          telegramToken: null,
          telegramRequestPending: false,
          telegramRequestTTL: null,
        },
      });
    });

    it("should return error when registration token expired", async () => {
      const mockUser = {
        id: "user-1",
        telegramToken: mockToken,
        telegramRequestPending: true,
        telegramRequestTTL: new Date(Date.now() - 10 * 60 * 1000), // expired
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.registerTelegram(mockToken, mockTelegramId);

      expect(result).toEqual({
        success: false,
        error: "The last telegram registration request has expired. Please start the registration process again.",
      });
    });

    it("should throw error when update fails", async () => {
      const mockUser = {
        id: "user-1",
        telegramToken: mockToken,
        telegramRequestPending: true,
        telegramRequestTTL: new Date(Date.now() + 10 * 60 * 1000),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(null);

      await expect(
        repository.registerTelegram(mockToken, mockTelegramId)
      ).rejects.toThrow("Failed to update user with telegram ID.");
    });
  });

  describe("startTelegramRegistration", () => {
    const mockUserId = "user-1";
    const mockToken = "new-token-456";

    it("should start telegram registration for citizen", async () => {
      const mockUser = {
        id: mockUserId,
        role: ["CITIZEN"],
        telegramRequestPending: false,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        telegramToken: mockToken,
        telegramRequestPending: true,
      });

      const result = await repository.startTelegramRegistration(
        mockUserId,
        mockToken
      );

      expect(result).toEqual({
        success: true,
        data: mockToken,
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: {
          telegramToken: mockToken,
          telegramRequestPending: true,
          telegramRequestTTL: expect.any(Date),
        },
      });
    });

    it("should throw error when user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        repository.startTelegramRegistration(mockUserId, mockToken)
      ).rejects.toThrow("User not found");
    });

    it("should throw error when user is not a citizen", async () => {
      const mockUser = {
        id: mockUserId,
        role: ["TECHNICAL_OFFICER"],
        telegramRequestPending: false,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        repository.startTelegramRegistration(mockUserId, mockToken)
      ).rejects.toThrow("Only citizens can register telegram accounts");
    });

    it("should reset old pending requests before starting new one", async () => {
      const mockUser = {
        id: mockUserId,
        role: ["CITIZEN"],
        telegramRequestPending: true,
        telegramToken: "old-token",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        telegramToken: mockToken,
      });

      const result = await repository.startTelegramRegistration(
        mockUserId,
        mockToken
      );

      expect(result.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledTimes(2);
    });

    it("should throw error when update fails", async () => {
      const mockUser = {
        id: mockUserId,
        role: ["CITIZEN"],
        telegramRequestPending: false,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(null);

      await expect(
        repository.startTelegramRegistration(mockUserId, mockToken)
      ).rejects.toThrow("Failed to start telegram registration.");
    });
  });

  describe("isAuthenticated", () => {
    const mockChatId = 987654321;

    it("should return authenticated user", async () => {
      const mockUser = {
        id: "user-1",
        username: "testuser",
        telegramChatId: mockChatId.toString(),
        telegramRequestPending: false,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.isAuthenticated(mockChatId);

      expect(result).toEqual({
        success: true,
        data: "testuser",
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { telegramChatId: mockChatId.toString() },
      });
    });

    it("should return error when user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.isAuthenticated(mockChatId);

      expect(result).toEqual({
        success: false,
        error: "User not authenticated with this Telegram account.",
      });
    });

    it("should return error when registration pending and not expired", async () => {
      const mockUser = {
        id: "user-1",
        username: "testuser",
        telegramChatId: mockChatId.toString(),
        telegramRequestPending: true,
        telegramRequestTTL: new Date(Date.now() + 10 * 60 * 1000),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.isAuthenticated(mockChatId);

      expect(result).toEqual({
        success: false,
        error: "Telegram registration is still pending.",
      });
    });

    it("should clean up and return error when registration expired", async () => {
      const mockUser = {
        id: "user-1",
        username: "testuser",
        telegramChatId: mockChatId.toString(),
        telegramRequestPending: true,
        telegramRequestTTL: new Date(Date.now() - 10 * 60 * 1000),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.isAuthenticated(mockChatId);

      expect(result).toEqual({
        success: false,
        error: "The previous telegram registration request has expired. Please start the registration process again.",
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: {
          telegramToken: null,
          telegramRequestPending: false,
          telegramRequestTTL: null,
        },
      });
    });
  });
});
