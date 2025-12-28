import { Context } from "grammy";
import { handleStart } from "../../handlers/start";
import * as telegramUtils from "../../utils/telegram.utils";

jest.mock("../../utils/telegram.utils");

describe("Start Handler", () => {
  let mockCtx: Partial<Context>;
  const mockCallTelegramApi =
    telegramUtils.callTelegramApi as jest.MockedFunction<
      typeof telegramUtils.callTelegramApi
    >;
  const mockExtractAuthToken =
    telegramUtils.extractAuthTokenFromStartCommand as jest.MockedFunction<
      typeof telegramUtils.extractAuthTokenFromStartCommand
    >;
  const mockFormatWelcomeBackMessage =
    telegramUtils.formatWelcomeBackMessage as jest.MockedFunction<
      typeof telegramUtils.formatWelcomeBackMessage
    >;
  const mockFormatAuthInstructionsMessage =
    telegramUtils.formatAuthInstructionsMessage as jest.MockedFunction<
      typeof telegramUtils.formatAuthInstructionsMessage
    >;
  const mockFormatWelcomeMessage =
    telegramUtils.formatWelcomeMessage as jest.MockedFunction<
      typeof telegramUtils.formatWelcomeMessage
    >;
  const mockFormatAuthErrorMessage =
    telegramUtils.formatAuthErrorMessage as jest.MockedFunction<
      typeof telegramUtils.formatAuthErrorMessage
    >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCtx = {
      chatId: 12345,
      from: { username: "testuser" } as Context["from"],
      message: { text: "/start" } as Context["message"],
      reply: jest.fn() as Context["reply"],
    };
  });

  it("should welcome back an already authenticated user", async () => {
    mockCallTelegramApi.mockResolvedValueOnce({
      success: true,
      data: "testuser",
    });
    mockFormatWelcomeBackMessage.mockReturnValue("Welcome back, testuser!");

    await handleStart(mockCtx as Context);

    expect(mockCallTelegramApi).toHaveBeenCalledWith(
      telegramUtils.TELEGRAM_API.IS_AUTHENTICATED,
      expect.any(Object),
    );
    expect(mockCtx.reply).toHaveBeenCalledWith("Welcome back, testuser!");
  });

  it("should show instructions if no auth token is provided", async () => {
    mockCallTelegramApi.mockResolvedValueOnce({
      success: false,
      data: null,
    });
    mockExtractAuthToken.mockReturnValue(null);
    mockFormatAuthInstructionsMessage.mockReturnValue(
      "Please provide a token.",
    );

    await handleStart(mockCtx as Context);

    expect(mockCtx.reply).toHaveBeenCalledWith("Please provide a token.");
  });

  it("should register user if a valid auth token is provided", async () => {
    mockCallTelegramApi
      .mockResolvedValueOnce({ success: false, data: null }) // IS_AUTHENTICATED
      .mockResolvedValueOnce({ success: true, data: "New User" }); // REGISTER

    mockExtractAuthToken.mockReturnValue("valid_token");
    mockFormatWelcomeMessage.mockReturnValue("Welcome, New User!");

    mockCtx.message!.text = "/start valid_token";

    await handleStart(mockCtx as Context);

    expect(mockCallTelegramApi).toHaveBeenNthCalledWith(
      2,
      telegramUtils.TELEGRAM_API.REGISTER,
      expect.objectContaining({
        body: JSON.stringify({ authToken: "valid_token", chatId: 12345 }),
      }),
    );
    expect(mockCtx.reply).toHaveBeenCalledWith("Welcome, New User!");
  });

  it("should show error message if registration fails", async () => {
    mockCallTelegramApi
      .mockResolvedValueOnce({ success: false, data: null }) // IS_AUTHENTICATED
      .mockResolvedValueOnce({ success: false, error: "Invalid token" }); // REGISTER

    mockExtractAuthToken.mockReturnValue("invalid_token");
    mockFormatAuthErrorMessage.mockReturnValue("Error: Invalid token");

    mockCtx.message!.text = "/start invalid_token";

    await handleStart(mockCtx as Context);

    expect(mockCtx.reply).toHaveBeenCalledWith("Error: Invalid token");
  });

  it("should handle unexpected errors", async () => {
    mockCallTelegramApi.mockRejectedValue(new Error("Network error"));

    await handleStart(mockCtx as Context);

    expect(mockCtx.reply).toHaveBeenCalledWith(
      "An unexpected error occurred. Please try again later or contact support.",
    );
  });
});
