import { prisma } from "../../setup";
import { getServerSession } from "next-auth/next";
import { ReportRegistrationResponse } from "../../../src/app/lib/dtos/report.dto";
import { createReport } from "../../../src/app/lib/controllers/report.controller";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("next-auth", () => ({
    __esModule: true,
    default: jest.fn(() => ({
      handlers: { GET: jest.fn(), POST: jest.fn() },
      auth: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
    })),
}));

jest.mock("@/auth", () => ({
    authOptions: {},
}));

jest.mock("@/auth", () => ({
  authOptions: {},
}));

describe("Story 4 - Integration Test: Report Registration", () => {
  beforeEach(async () => {
    if (prisma.notification) await prisma.notification.deleteMany({});
    await prisma.photo.deleteMany({});
    await prisma.report.deleteMany({});
    if (prisma.profilePhoto) await prisma.profilePhoto.deleteMany({});
    if (prisma.notificationPreferences) await prisma.notificationPreferences.deleteMany({});
    await prisma.user.deleteMany({});

    await prisma.photo.create({
      data: {
        id: "photo1",
        url: "photo1",
        size: 100,
        offset: 0,
        filename: "photo1",
      },
    });
    await prisma.user.create({
      data: {
        id: "1",
        username: "user1",
        passwordHash: "password",
        firstName: "user",
        lastName: "user",
        role: "CITIZEN",
      },
    });

    await prisma.user.create({
      data: {
        id: "2",
        username: "user2",
        passwordHash: "password",
        firstName: "user",
        lastName: "user",
        role: "CITIZEN",
      },
    });
  });

  describe("Report Registration Flow", () => {
    it("should successfully register a new anonimous REPORT through the complete flow", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: "1",
          firstName: "mock",
          lastName: "mock",
          email: "mock@mock.it",
          username: "mock",
          role: "CITIZEN",
        },
        expires: "2099-01-01T00:00:00.000Z",
      });

      const response: ReportRegistrationResponse = await createReport(
        "mockReview",
        "mockDescriptionLongEnough",
        ["photo1"],
        "WATER_SUPPLY",
        10,
        10,
        true
      );

      expect(response.success).toBe(true);
      if (response.success) {
        const match = response.data.match(/id:\s*(\d+)/);
        expect(match).not.toBeNull();
        const id = match![1];
        expect(response.data).toBe(`Report with id: ${id} succesfuly created`);

        const savedReport = await prisma.report.findUnique({
          where: { id: Number.parseInt(id) },
        });
        expect(savedReport).not.toBeNull();
        expect(savedReport).toMatchObject({
          title: "mockReview",
          description: "mockDescriptionLongEnough",
          status: "PENDING_APPROVAL",
          category: "WATER_SUPPLY",
          createdAt: expect.any(Date),
          longitude: 10,
          latitude: 10,
          citizenId: "1",
        });
      }
    });

    it("should successfully register a new REPORT through the complete flow", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: "1", // Added ID to fix validation failure
          firstName: "mock",
          lastName: "mock",
          email: "mock@mock.it",
          username: "mock",
          role: "CITIZEN",
        },
        expires: "2099-01-01T00:00:00.000Z",
      });

      const response: ReportRegistrationResponse = await createReport(
        "mockReview",
        "mockDescriptionLongEnough",
        ["photo1"],
        "WATER_SUPPLY",
        10,
        10,
        false
      );

      expect(response.success).toBe(true);
      if (response.success) {
        const match = response.data.match(/id:\s*(\d+)/);
        expect(match).not.toBeNull();
        const id = match![1];
        expect(response.data).toBe(`Report with id: ${id} succesfuly created`);

        const savedReport = await prisma.report.findUnique({
          where: { id: Number.parseInt(id) },
        });
        expect(savedReport).not.toBeNull();
        expect(savedReport).toMatchObject({
          title: "mockReview",
          description: "mockDescriptionLongEnough",
          status: "PENDING_APPROVAL",
          category: "WATER_SUPPLY",
          createdAt: expect.any(Date),
          longitude: 10,
          latitude: 10,
          citizenId: "1",
        });
      }
    });

    it("should reject the registration a new REPORT with invalid fields fields", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          firstName: "mock",
          lastName: "mock",
          email: "mock@mock.it",
          username: "mock",
          role: "CITIZEN",
        },
        expires: "2099-01-01T00:00:00.000Z",
      });

      const response: ReportRegistrationResponse = await createReport(
        "m",
        "m",
        ["photo1"],
        "WATER_SUPPLY",
        10,
        10,
        true
      );
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Invalid inputs");
      }
    });

    it("should reject the registration a new REPORT without photos", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          firstName: "mock",
          lastName: "mock",
          email: "mock@mock.it",
          username: "mock",
          role: "CITIZEN",
        },
        expires: "2099-01-01T00:00:00.000Z",
      });

      const response: ReportRegistrationResponse = await createReport(
        "mockReview",
        "mockReviewLongDescription",
        [],
        "WATER_SUPPLY",
        10,
        10,
        true
      );
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Invalid inputs");
      }
    });

    it("should reject the registration a new REPORT without a session", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response: ReportRegistrationResponse = await createReport(
        "mockReview",
        "mockReviewLongDescription",
        ["photo1"],
        "WATER_SUPPLY",
        10,
        10,
        true
      );
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Unauthorized report");
      }
    });

    it("should reject the registration a new REPORT with a officer user", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          firstName: "mock",
          lastName: "mock",
          email: "mock@mock.it",
          username: "mock",
          role: "PUBLIC_RELATIONS_OFFICER",
        },
        expires: "2099-01-01T00:00:00.000Z",
      });

      const response: ReportRegistrationResponse = await createReport(
        "mockReview",
        "mockReviewLongDescription",
        ["photo1"],
        "WATER_SUPPLY",
        10,
        10,
        true
      );
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Unauthorized report");
      }
    });
  });
});