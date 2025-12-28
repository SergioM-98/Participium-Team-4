import { Context } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import { newReport } from "../../handlers/newReport";
import * as telegramUtils from "../../utils/telegram.utils";
import { CANCEL_CALLBACK_DATA } from "../../keyboards/cancelKeyboard";
import { ANONYMOUS_OPTIONS } from "../../keyboards/anonymousKeyboard";

jest.mock("../../utils/telegram.utils");

describe("New Report Conversation", () => {
  let mockCtx: Partial<Context>;
  let mockConversation: Partial<Conversation<Context>>;
  const mockCallTelegramApi =
    telegramUtils.callTelegramApi as jest.MockedFunction<
      typeof telegramUtils.callTelegramApi
    >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCtx = {
      chatId: 12345,
      reply: jest.fn() as Context["reply"],
      api: {
        getFile: jest.fn(),
        token: "bot_token",
      } as unknown as Context["api"],
    };
    mockConversation = {
      wait: jest.fn(),
    };
    globalThis.fetch = jest.fn();
  });

  it("should stop if user is not authenticated", async () => {
    mockCallTelegramApi.mockResolvedValueOnce({
      success: false,
      data: null,
    });

    await newReport(
      mockConversation as Conversation<Context>,
      mockCtx as Context,
    );

    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining("You must link your Telegram account first"),
    );
  });

  it("should handle cancellation at the start", async () => {
    mockCallTelegramApi.mockResolvedValueOnce({
      success: true,
      data: true,
    });

    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      callbackQuery: { data: CANCEL_CALLBACK_DATA },
      answerCallbackQuery: jest.fn(),
    });

    await newReport(
      mockConversation as Conversation<Context>,
      mockCtx as Context,
    );

    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining("Report creation cancelled"),
    );
  });

  it("should complete a full report submission successfully", async () => {
    mockCallTelegramApi.mockResolvedValueOnce({
      success: true,
      data: true,
    });

    // 1. Anonymous choice
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      callbackQuery: { data: ANONYMOUS_OPTIONS[0].callback_data },
    });

    // 2. Title
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      message: { text: "Valid Report Title" },
    });

    // 3. Description
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      message: { text: "This is a valid description for the report." },
    });

    // 4. Category
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      callbackQuery: { data: "WASTE" },
    });

    // 5. Location
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      message: {
        location: { latitude: 45.1, longitude: 7.6 }, // Inside Turin
      },
    });

    // 6. Photos (collectPhotos)
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      message: {
        photo: [{ file_id: "photo1" }],
      },
    });
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      message: { text: "/done" },
    });

    // Mock photo download
    (mockCtx.api!.getFile as jest.Mock).mockResolvedValue({
      file_path: "path/to/photo",
    });
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(new Blob()),
      }) // Photo download
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      }); // Report submission

    process.env.BACKEND_URL = "http://localhost:3000";

    await newReport(
      mockConversation as Conversation<Context>,
      mockCtx as Context,
    );

    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining("Report sent successfully"),
    );
  });

  it("should validate title length", async () => {
    mockCallTelegramApi.mockResolvedValueOnce({
      success: true,
      data: true,
    });

    // 1. Anonymous choice
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      callbackQuery: { data: ANONYMOUS_OPTIONS[0].callback_data },
    });

    // 2. Invalid Title (too short)
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      message: { text: "abc" },
    });

    // 3. Valid Title
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      message: { text: "Valid Report Title" },
    });

    // 4. Cancel at Description to stop the test
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      callbackQuery: { data: CANCEL_CALLBACK_DATA },
      answerCallbackQuery: jest.fn(),
    });

    await newReport(
      mockConversation as Conversation<Context>,
      mockCtx as Context,
    );

    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining("Title must be between"),
      expect.any(Object),
    );
  });

  it("should validate location bounds", async () => {
    mockCallTelegramApi.mockResolvedValueOnce({
      success: true,
      data: true,
    });

    // 1. Anonymous choice
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      callbackQuery: { data: ANONYMOUS_OPTIONS[0].callback_data },
    });

    // 2. Title
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      message: { text: "Valid Report Title" },
    });

    // 3. Description
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      message: { text: "This is a valid description for the report." },
    });

    // 4. Category
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      callbackQuery: { data: "WASTE" },
    });

    // 5. Location outside Turin
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      message: {
        location: { latitude: 0, longitude: 0 },
      },
    });

    // 6. Cancel to stop
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      callbackQuery: { data: CANCEL_CALLBACK_DATA },
      answerCallbackQuery: jest.fn(),
    });

    await newReport(
      mockConversation as Conversation<Context>,
      mockCtx as Context,
    );

    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining("outside Turin"),
      expect.any(Object),
    );
  });

  it("should require at least one photo", async () => {
    mockCallTelegramApi.mockResolvedValueOnce({
      success: true,
      data: true,
    });

    // 1. Anonymous choice
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      callbackQuery: { data: ANONYMOUS_OPTIONS[0].callback_data },
    });

    // 2. Title
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      message: { text: "Valid Report Title" },
    });

    // 3. Description
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      message: { text: "This is a valid description for the report." },
    });

    // 4. Category
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      callbackQuery: { data: "WASTE" },
    });

    // 5. Location
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      message: {
        location: { latitude: 45.1, longitude: 7.6 },
      },
    });

    // 6. Try to finish without photos
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      message: { text: "/done" },
    });

    // 7. Cancel to stop
    (mockConversation.wait as jest.Mock).mockResolvedValueOnce({
      callbackQuery: { data: CANCEL_CALLBACK_DATA },
      answerCallbackQuery: jest.fn(),
    });

    await newReport(
      mockConversation as Conversation<Context>,
      mockCtx as Context,
    );

    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining("You must upload at least one photo"),
    );
  });
});
