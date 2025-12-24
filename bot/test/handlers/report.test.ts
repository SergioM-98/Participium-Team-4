import { Context } from "grammy";
import { handleReportCommand } from "../../handlers/report";
import * as telegramUtils from "../../utils/telegram.utils";

jest.mock("../../utils/telegram.utils");

describe("Story 13 - Bot Integration: View Single Report Status", () => {
  let mockCtx: Partial<Context>;
  const mockCallTelegramApi =
    telegramUtils.callTelegramApi as jest.MockedFunction<
      typeof telegramUtils.callTelegramApi
    >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCtx = {
      chatId: 12345,
      message: { text: "/report 1001" } as Context["message"],
      reply: jest.fn() as Context["reply"],
    };
  });

  it("should validate report ID from command input", async () => {
    mockCallTelegramApi.mockResolvedValue({
      success: false,
      data: null,
    });

    mockCtx = {
      chatId: 12345,
      message: { text: "/report" } as Context["message"],
      reply: jest.fn() as Context["reply"],
    };
    await handleReportCommand(mockCtx as Context);

    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining("Usage: /report"),
    );
  });

  it("should authenticate user before fetching report", async () => {
    mockCallTelegramApi
      .mockResolvedValueOnce({ success: true, data: true })
      .mockResolvedValueOnce({
        success: true,
        data: [
          {
            id: "1001",
            title: "Test Report",
            description: "Test Description",
            status: "resolved",
            photos: [],
            category: "WASTE",
            longitude: 10.5,
            latitude: 45.5,
          },
        ],
      });

    await handleReportCommand(mockCtx as Context);

    expect(mockCallTelegramApi).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("isAuthenticated"),
      expect.any(Object),
    );
  });

  it("should fetch and display report details", async () => {
    mockCallTelegramApi
      .mockResolvedValueOnce({ success: true, data: true })
      .mockResolvedValueOnce({
        success: true,
        data: [
          {
            id: "1001",
            title: "Test Report",
            description: "Test Description",
            status: "resolved",
            photos: [],
            category: "WASTE",
            longitude: 10.5,
            latitude: 45.5,
          },
        ],
      });

    await handleReportCommand(mockCtx as Context);

    expect(mockCtx.reply).toHaveBeenCalled();
  });

  it("should handle authentication failure", async () => {
    mockCallTelegramApi.mockResolvedValueOnce({
      success: false,
      data: null,
    });

    await handleReportCommand(mockCtx as Context);

    expect(mockCtx.reply).toHaveBeenCalled();
  });

  it("should handle report not found", async () => {
    mockCallTelegramApi
      .mockResolvedValueOnce({ success: true, data: true })
      .mockResolvedValueOnce({
        success: true,
        data: [],
      });

    await handleReportCommand(mockCtx as Context);

    expect(mockCtx.reply).toHaveBeenCalled();
  });
});
