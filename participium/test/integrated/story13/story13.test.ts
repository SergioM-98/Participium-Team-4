import { prisma } from "../../setup";
import {
  getReportsByCitizenTelegramChatId,
  getReportByIdForTelegramUser,
} from "../../../src/app/lib/controllers/report.controller";
import { isUserAuthenticatedByTelegram } from "../../../src/app/lib/controllers/telegramBot.controller";

describe("Story 13 - Integration Test: Check Report Status via Telegram", () => {
  const chatId = "12345";
  const chatIdNumber = Number(chatId);

  beforeEach(async () => {
    // Clean up database
    await prisma.message.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.photo.deleteMany({});
    await prisma.report.deleteMany({});
    await prisma.user.deleteMany({});

    // Create a citizen user with telegram account
    await prisma.user.create({
      data: {
        id: "citizen_001",
        firstName: "Alice",
        lastName: "Johnson",
        username: "alice_citizen",
        passwordHash: "hash",
        email: "alice@example.com",
        telegramChatId: chatId,
        role: ["CITIZEN"],
      },
    });
  });

  it("should authenticate telegram user", async () => {
    const result = await isUserAuthenticatedByTelegram(chatIdNumber);
    expect(result.success).toBe(true);
  });

  it("should reject non-authenticated telegram user", async () => {
    const result = await isUserAuthenticatedByTelegram(999999);
    expect(result.success).toBe(false);
  });

  it("should retrieve empty list when citizen has no reports", async () => {
    const result = await getReportsByCitizenTelegramChatId(chatId);
    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it("should retrieve reports with correct status formatting", async () => {
    await prisma.report.createMany({
      data: [
        {
          id: 1001,
          title: "Resolved Report",
          description: "Fixed issue",
          category: "ROADS_AND_URBAN_FURNISHINGS",
          latitude: 45.0703,
          longitude: 7.6869,
          citizenId: "citizen_001",
          status: "RESOLVED",
        },
        {
          id: 1002,
          title: "In Progress Report",
          description: "Being fixed",
          category: "PUBLIC_LIGHTING",
          latitude: 45.0703,
          longitude: 7.6869,
          citizenId: "citizen_001",
          status: "IN_PROGRESS",
        },
        {
          id: 1003,
          title: "Pending Report",
          description: "Pending review",
          category: "WASTE",
          latitude: 45.0703,
          longitude: 7.6869,
          citizenId: "citizen_001",
          status: "PENDING_APPROVAL",
        },
      ],
    });

    const result = await getReportsByCitizenTelegramChatId(chatId);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(3);
    expect(result.data.map((r) => r.status)).toEqual([
      "resolved",
      "in_progress",
      "pending_approval",
    ]);
  });

  it("should retrieve specific report by ID", async () => {
    await prisma.report.create({
      data: {
        id: 1004,
        title: "Specific Report",
        description: "A specific report",
        category: "PUBLIC_LIGHTING",
        latitude: 45.0703,
        longitude: 7.6869,
        citizenId: "citizen_001",
        status: "IN_PROGRESS",
      },
    });

    const result = await getReportByIdForTelegramUser("1004", chatId);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toEqual(
      expect.objectContaining({
        id: "1004",
        status: "in_progress",
      }),
    );
  });
});
