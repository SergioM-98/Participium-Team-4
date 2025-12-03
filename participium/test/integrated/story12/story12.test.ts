import { prisma } from "../../setup";
import { getServerSession } from "next-auth/next";
import { registerTelegramReport } from "../../../src/app/lib/controllers/telegramBot.controller";
import { createUploadPhoto } from "../../../src/app/lib/controllers/uploader.controller";


jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));
    
jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

describe("Story 12 - Integration Test: registerTelegramReport", () => {
  beforeEach(async () => {
    if (prisma.notification) {
      await prisma.notification.deleteMany({});
    }
    
    await prisma.photo.deleteMany({});
    await prisma.report.deleteMany({});
    if (prisma.notificationPreferences) {
      await prisma.notificationPreferences.deleteMany({});
    }
    await prisma.user.deleteMany({});

    await prisma.user.create({
      data: {
        id: "10",
        firstName: "John",
        lastName: "Doe",
        username: "telegramUser",
        passwordHash: "hash",
        email: "john@doe.com",
        telegram: "12345", // <---- MATCHES chatId
        role: "CITIZEN",
      },
    });

    (getServerSession as jest.Mock).mockResolvedValue({
      user: {
        id: "10",
        firstName: "John",
        lastName: "Doe",
        username: "telegramUser",
        role: "CITIZEN",
        email: "john@doe.com",
      },
      expires: "2099-01-01T00:00:00.000Z",
    });
  });

  it("should create a new report with 3 photos via registerTelegramReport", async () => {
    const f1 = new File(["11111"], "photo1.jpg", { type: "image/jpeg" });
    const f2 = new File(["22222"], "photo2.jpg", { type: "image/jpeg" });
    const f3 = new File(["33333"], "photo3.jpg", { type: "image/jpeg" });

    const photos = [f1, f2, f3];

    const request = {
      chatId: "12345",   // <-- MUST BE STRING (DTO requires string)
      title: "Broken bench",
      description: "A broken bench near the park fountain",
      latitude: "45.0703",
      longitude: "7.6869",
      category: "PUBLIC_LIGHTING",
      isAnonymous: false,
    };

    const result = await registerTelegramReport(request, photos);

    expect(result.success).toBe(true);

    const reports = await prisma.report.findMany({
      include: { photos: true },
    });

    expect(reports.length).toBe(1);

    const report = reports[0];

    expect(report.title).toBe("Broken bench");
    expect(report.description).toBe("A broken bench near the park fountain");
    expect(report.latitude).toBe(45.0703);
    expect(report.longitude).toBe(7.6869);
    expect(report.category).toBe("PUBLIC_LIGHTING");

    // citizenId should match non-anonymous user
    expect(report.citizenId).toBe("10");

    // must save 3 photos
    expect(report.photos.length).toBe(3);
  });

  it("should fail when telegram user is not found", async () => {
    const badRequest = {
      chatId: "999999",
      title: "Test",
      description: "Test test",
      latitude: "1",
      longitude: "1",
      category: "OTHER",
      isAnonymous: false,
    };

    const result = await registerTelegramReport(badRequest, []);

    expect(result.success).toBe(false);
  });
});