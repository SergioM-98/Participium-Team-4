import { Context } from "grammy";
import {
  handleMyReports,
  handlePaginationCallback,
} from "../../handlers/myReports";
import { CitizenReport } from "../../dtos/report.dto";
import * as telegramUtils from "../../utils/telegram.utils";

jest.mock("../../utils/telegram.utils");

describe("Story 13 - Bot Integration: Check Report Status via Telegram", () => {
  let mockCtx: Partial<Context>;
  const mockCallTelegramApi = telegramUtils.callTelegramApi as jest.MockedFunction<
    typeof telegramUtils.callTelegramApi
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCtx = {
      chatId: 12345,
      reply: jest.fn(),
      answerCallbackQuery: jest.fn(),
      editMessageText: jest.fn(),
    };
  });

  it("should authenticate and fetch reports from backend API", async () => {
    mockCallTelegramApi
      .mockResolvedValueOnce({ success: true, data: true })
      .mockResolvedValueOnce({ success: true, data: [] });

    await handleMyReports(mockCtx as Context);

    expect(mockCallTelegramApi).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("isAuthenticated"),
      expect.any(Object)
    );
  });

  it("should show empty message when citizen has no reports", async () => {
    mockCallTelegramApi
      .mockResolvedValueOnce({ success: true, data: true })
      .mockResolvedValueOnce({ success: true, data: [] });

    await handleMyReports(mockCtx as Context);

    expect(mockCtx.reply).toHaveBeenCalled();
  });

  it("should display multiple reports with pagination", async () => {
    const mockReports: CitizenReport[] = Array.from({ length: 7 }, (_, i) => ({
      id: `report${i}`,
      title: `Report ${i}`,
      description: `Desc ${i}`,
      photos: [],
      category: "WASTE",
      longitude: 10 + i * 0.1,
      latitude: 45 + i * 0.1,
      status: "RESOLVED",
    }));

    mockCallTelegramApi
      .mockResolvedValueOnce({ success: true, data: true })
      .mockResolvedValueOnce({ success: true, data: mockReports });

    await handleMyReports(mockCtx as Context);

    expect(mockCtx.reply).toHaveBeenCalledTimes(2);
  });

  it("should handle authentication failure", async () => {
    mockCallTelegramApi.mockResolvedValueOnce({
      success: false,
      data: null,
    });

    await handleMyReports(mockCtx as Context);

    expect(mockCtx.reply).toHaveBeenCalled();
  });

  it("should handle pagination correctly", async () => {
    const mockReports: CitizenReport[] = Array.from({ length: 7 }, (_, i) => ({
      id: `report${i}`,
      title: `Report ${i}`,
      description: `Desc ${i}`,
      photos: [],
      category: "WASTE",
      longitude: 10,
      latitude: 45,
      status: "RESOLVED",
    }));

    await handlePaginationCallback(mockCtx as Context, mockReports, 2);

    expect(mockCtx.editMessageText).toHaveBeenCalled();
  });
});
