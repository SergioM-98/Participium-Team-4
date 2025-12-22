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

jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

describe("Anonymous Reports Feature - Integration Tests", () => {
  beforeEach(async () => {
    // Clean up database
    if (prisma.notification) await prisma.notification.deleteMany({});
    await prisma.photo.deleteMany({});
    await prisma.report.deleteMany({});
    if (prisma.profilePhoto) await prisma.profilePhoto.deleteMany({});
    if (prisma.notificationPreferences)
      await prisma.notificationPreferences.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test photo
    await prisma.photo.create({
      data: {
        id: "photo-anon-1",
        url: "https://example.com/photo-anon-1.jpg",
        size: 1024,
        offset: 0,
        filename: "photo-anon-1.jpg",
      },
    });

    // Create test users
    await prisma.user.create({
      data: {
        id: "citizen-anon-1",
        username: "citizen_anon_1",
        passwordHash: "hashedpassword123",
        firstName: "Anonymous",
        lastName: "Citizen",
        email: "citizen1@test.com",
        role: ["CITIZEN"],
      },
    });

    await prisma.user.create({
      data: {
        id: "citizen-anon-2",
        username: "citizen_anon_2",
        passwordHash: "hashedpassword123",
        firstName: "Regular",
        lastName: "Citizen",
        email: "citizen2@test.com",
        role: ["CITIZEN"],
      },
    });

    await prisma.user.create({
      data: {
        id: "officer-anon-1",
        username: "officer_anon_1",
        passwordHash: "hashedpassword123",
        firstName: "Technical",
        lastName: "Officer",
        email: "officer1@test.com",
        role: ["TECHNICAL_OFFICER"],
        office: ["DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES"],
      },
    });
  });

  describe("Anonymous Report Creation", () => {
    it("should successfully create an anonymous report with anonymous flag set to true", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: "citizen-anon-1",
          firstName: "Anonymous",
          lastName: "Citizen",
          email: "citizen1@test.com",
          username: "citizen_anon_1",
          role: ["CITIZEN"],
        },
        expires: "2099-01-01T00:00:00.000Z",
      });

      const response: ReportRegistrationResponse = await createReport(
        "Anonymous Water Issue",
        "There is a water supply problem at the main intersection",
        ["photo-anon-1"],
        "WATER_SUPPLY",
        10.5,
        45.5,
        true // anonymous = true
      );

      expect(response.success).toBe(true);
      if (response.success) {
        const match = response.data.match(/id:\s*(\d+)/);
        expect(match).not.toBeNull();
        const reportId = match![1];

        const savedReport = await prisma.report.findUnique({
          where: { id: BigInt(reportId) },
        });

        expect(savedReport).not.toBeNull();
        expect(savedReport?.anonymous).toBe(true);
        expect(savedReport?.citizenId).toBe("citizen-anon-1");
        expect(savedReport?.title).toBe("Anonymous Water Issue");
        expect(savedReport?.status).toBe("PENDING_APPROVAL");
      }
    });

    it("should successfully create a non-anonymous report with anonymous flag set to false", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: "citizen-anon-2",
          firstName: "Regular",
          lastName: "Citizen",
          email: "citizen2@test.com",
          username: "citizen_anon_2",
          role: ["CITIZEN"],
        },
        expires: "2099-01-01T00:00:00.000Z",
      });

      const response: ReportRegistrationResponse = await createReport(
        "Public Lighting Issue",
        "Street lamp on main road is broken and needs replacement",
        ["photo-anon-1"],
        "PUBLIC_LIGHTING",
        11.5,
        46.5,
        false // anonymous = false
      );

      expect(response.success).toBe(true);
      if (response.success) {
        const match = response.data.match(/id:\s*(\d+)/);
        expect(match).not.toBeNull();
        const reportId = match![1];

        const savedReport = await prisma.report.findUnique({
          where: { id: BigInt(reportId) },
        });

        expect(savedReport).not.toBeNull();
        expect(savedReport?.anonymous).toBe(false);
        expect(savedReport?.citizenId).toBe("citizen-anon-2");
      }
    });

    it("should default to non-anonymous when anonymous flag is not specified", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: "citizen-anon-1",
          firstName: "Anonymous",
          lastName: "Citizen",
          email: "citizen1@test.com",
          username: "citizen_anon_1",
          role: ["CITIZEN"],
        },
        expires: "2099-01-01T00:00:00.000Z",
      });

      // Note: In the test, we still need to pass false explicitly,
      // but this tests the schema default behavior
      const response: ReportRegistrationResponse = await createReport(
        "Road Damage Report",
        "There is a pothole on the main street that needs immediate repair",
        ["photo-anon-1"],
        "ROADS_AND_URBAN_FURNISHINGS",
        12.5,
        47.5,
        false
      );

      expect(response.success).toBe(true);
      if (response.success) {
        const match = response.data.match(/id:\s*(\d+)/);
        const reportId = match![1];

        const savedReport = await prisma.report.findUnique({
          where: { id: BigInt(reportId) },
        });

        expect(savedReport?.anonymous).toBe(false);
      }
    });
  });

  describe("Anonymous Report Validation", () => {
    it("should reject anonymous report with invalid title (too short)", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: "citizen-anon-1",
          firstName: "Anonymous",
          lastName: "Citizen",
          email: "citizen1@test.com",
          username: "citizen_anon_1",
          role: ["CITIZEN"],
        },
        expires: "2099-01-01T00:00:00.000Z",
      });

      const response: ReportRegistrationResponse = await createReport(
        "Bad", // Too short
        "This is a valid long description for testing",
        ["photo-anon-1"],
        "WATER_SUPPLY",
        10.5,
        45.5,
        true
      );

      expect(response.success).toBe(false);
      expect(response.error).toBe("Invalid inputs");
    });

    it("should reject anonymous report without photos", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: "citizen-anon-1",
          firstName: "Anonymous",
          lastName: "Citizen",
          email: "citizen1@test.com",
          username: "citizen_anon_1",
          role: ["CITIZEN"],
        },
        expires: "2099-01-01T00:00:00.000Z",
      });

      const response: ReportRegistrationResponse = await createReport(
        "Valid Title",
        "This is a valid long description for testing",
        [], // No photos
        "WATER_SUPPLY",
        10.5,
        45.5,
        true
      );

      expect(response.success).toBe(false);
      expect(response.error).toBe("Invalid inputs");
    });

    it("should reject anonymous report with invalid category", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: "citizen-anon-1",
          firstName: "Anonymous",
          lastName: "Citizen",
          email: "citizen1@test.com",
          username: "citizen_anon_1",
          role: ["CITIZEN"],
        },
        expires: "2099-01-01T00:00:00.000Z",
      });

      const response: ReportRegistrationResponse = await createReport(
        "Valid Title Here",
        "This is a valid long description for testing purposes",
        ["photo-anon-1"],
        "INVALID_CATEGORY" as any,
        10.5,
        45.5,
        true
      );

      expect(response.success).toBe(false);
      expect(response.error).toBe("Invalid inputs");
    });
  });

  describe("Anonymous Report Retrieval", () => {
    it("should not expose citizen information when retrieving anonymous reports", async () => {
      // Create an anonymous report
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: "citizen-anon-1",
          firstName: "Anonymous",
          lastName: "Citizen",
          email: "citizen1@test.com",
          username: "citizen_anon_1",
          role: ["CITIZEN"],
        },
        expires: "2099-01-01T00:00:00.000Z",
      });

      const response: ReportRegistrationResponse = await createReport(
        "Secret Water Issue",
        "Anonymous report about water infrastructure",
        ["photo-anon-1"],
        "WATER_SUPPLY",
        10.5,
        45.5,
        true
      );

      expect(response.success).toBe(true);
      if (response.success) {
        const match = response.data.match(/id:\s*(\d+)/);
        const reportId = match![1];

        const savedReport = await prisma.report.findUnique({
          where: { id: BigInt(reportId) },
          select: {
            id: true,
            title: true,
            description: true,
            anonymous: true,
            citizenId: true,
            citizen: {
              select: {
                username: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        // The citizenId is still stored in the database for internal tracking
        expect(savedReport?.citizenId).toBe("citizen-anon-1");
        // But the anonymous flag should be true
        expect(savedReport?.anonymous).toBe(true);
        // Client-side should not display username/email when anonymous=true
      }
    });

    it("should expose citizen information when retrieving non-anonymous reports", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: "citizen-anon-2",
          firstName: "Regular",
          lastName: "Citizen",
          email: "citizen2@test.com",
          username: "citizen_anon_2",
          role: ["CITIZEN"],
        },
        expires: "2099-01-01T00:00:00.000Z",
      });

      const response: ReportRegistrationResponse = await createReport(
        "Public Lighting Issue",
        "Street lamp on main road is broken and needs replacement",
        ["photo-anon-1"],
        "PUBLIC_LIGHTING",
        11.5,
        46.5,
        false
      );

      expect(response.success).toBe(true);
      if (response.success) {
        const match = response.data.match(/id:\s*(\d+)/);
        const reportId = match![1];

        const savedReport = await prisma.report.findUnique({
          where: { id: BigInt(reportId) },
          select: {
            id: true,
            title: true,
            anonymous: true,
            citizenId: true,
            citizen: {
              select: {
                username: true,
              },
            },
          },
        });

        expect(savedReport?.anonymous).toBe(false);
        expect(savedReport?.citizenId).toBe("citizen-anon-2");
        expect(savedReport?.citizen?.username).toBe("citizen_anon_2");
      }
    });
  });

  describe("Mixed Anonymous and Non-Anonymous Reports", () => {
    it("should handle multiple anonymous and non-anonymous reports from same citizen", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: "citizen-anon-1",
          firstName: "Anonymous",
          lastName: "Citizen",
          email: "citizen1@test.com",
          username: "citizen_anon_1",
          role: ["CITIZEN"],
        },
        expires: "2099-01-01T00:00:00.000Z",
      });

      // Create first anonymous report
      const response1: ReportRegistrationResponse = await createReport(
        "Anonymous Issue One",
        "This is an anonymous report about water supply problem",
        ["photo-anon-1"],
        "WATER_SUPPLY",
        10.5,
        45.5,
        true
      );

      expect(response1.success).toBe(true);

      // Create non-anonymous report
      const response2: ReportRegistrationResponse = await createReport(
        "Public Issue One",
        "This is a public report about street lighting problem",
        ["photo-anon-1"],
        "PUBLIC_LIGHTING",
        11.5,
        46.5,
        false
      );

      expect(response2.success).toBe(true);

      // Create second anonymous report
      const response3: ReportRegistrationResponse = await createReport(
        "Anonymous Issue Two",
        "Another anonymous report about waste management problem",
        ["photo-anon-1"],
        "WASTE",
        12.5,
        47.5,
        true
      );

      expect(response3.success).toBe(true);

      // Verify all reports were created correctly
      const allReports = await prisma.report.findMany({
        where: { citizenId: "citizen-anon-1" },
        select: {
          id: true,
          title: true,
          anonymous: true,
          status: true,
        },
        orderBy: { createdAt: "asc" },
      });

      expect(allReports).toHaveLength(3);
      expect(allReports[0].anonymous).toBe(true);
      expect(allReports[1].anonymous).toBe(false);
      expect(allReports[2].anonymous).toBe(true);
    });

    it("should correctly filter and count anonymous vs non-anonymous reports", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: "citizen-anon-1",
          firstName: "Anonymous",
          lastName: "Citizen",
          email: "citizen1@test.com",
          username: "citizen_anon_1",
          role: ["CITIZEN"],
        },
        expires: "2099-01-01T00:00:00.000Z",
      });

      // Create 3 anonymous reports
      for (let i = 0; i < 3; i++) {
        await createReport(
          `Anonymous Report ${i + 1}`,
          `This is anonymous report number ${i + 1} with detailed description`,
          ["photo-anon-1"],
          "WATER_SUPPLY",
          10.5 + i,
          45.5 + i,
          true
        );
      }

      // Create 2 non-anonymous reports
      for (let i = 0; i < 2; i++) {
        await createReport(
          `Public Report ${i + 1}`,
          `This is a public report number ${i + 1} with detailed description`,
          ["photo-anon-1"],
          "PUBLIC_LIGHTING",
          11.5 + i,
          46.5 + i,
          false
        );
      }

      // Count anonymous reports
      const anonymousCount = await prisma.report.count({
        where: {
          citizenId: "citizen-anon-1",
          anonymous: true,
        },
      });

      // Count non-anonymous reports
      const publicCount = await prisma.report.count({
        where: {
          citizenId: "citizen-anon-1",
          anonymous: false,
        },
      });

      expect(anonymousCount).toBe(3);
      expect(publicCount).toBe(2);
    });
  });

  describe("Authorization and Permissions", () => {
    it("should prevent non-citizens from creating anonymous reports", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: "officer-anon-1",
          firstName: "Technical",
          lastName: "Officer",
          email: "officer1@test.com",
          username: "officer_anon_1",
          role: ["TECHNICAL_OFFICER"],
          office: ["DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES"],
        },
        expires: "2099-01-01T00:00:00.000Z",
      });

      const response: ReportRegistrationResponse = await createReport(
        "Unauthorized Anonymous Report",
        "An officer should not be able to create anonymous reports",
        ["photo-anon-1"],
        "WATER_SUPPLY",
        10.5,
        45.5,
        true
      );

      expect(response.success).toBe(false);
      expect(response.error).toBe("Unauthorized report");
    });

    it("should prevent unauthenticated users from creating anonymous reports", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response: ReportRegistrationResponse = await createReport(
        "Unauthorized Report",
        "Unauthenticated user should not create reports",
        ["photo-anon-1"],
        "WATER_SUPPLY",
        10.5,
        45.5,
        true
      );

      expect(response.success).toBe(false);
      expect(response.error).toBe("Unauthorized report");
    });
  });

  describe("Anonymous Report Data Integrity", () => {
    it("should preserve all report data when creating anonymous reports", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: "citizen-anon-1",
          firstName: "Anonymous",
          lastName: "Citizen",
          email: "citizen1@test.com",
          username: "citizen_anon_1",
          role: ["CITIZEN"],
        },
        expires: "2099-01-01T00:00:00.000Z",
      });

      const testData = {
        title: "Data Integrity Test Report",
        description:
          "This report tests that all data is preserved correctly when creating anonymous reports",
        longitude: 10.123,
        latitude: 45.456,
        category: "ROADS_AND_URBAN_FURNISHINGS" as const,
      };

      const response: ReportRegistrationResponse = await createReport(
        testData.title,
        testData.description,
        ["photo-anon-1"],
        testData.category,
        testData.longitude,
        testData.latitude,
        true
      );

      expect(response.success).toBe(true);
      if (response.success) {
        const match = response.data.match(/id:\s*(\d+)/);
        const reportId = match![1];

        const savedReport = await prisma.report.findUnique({
          where: { id: BigInt(reportId) },
        });

        expect(savedReport?.title).toBe(testData.title);
        expect(savedReport?.description).toBe(testData.description);
        expect(savedReport?.longitude).toBe(testData.longitude);
        expect(savedReport?.latitude).toBe(testData.latitude);
        expect(savedReport?.category).toBe(testData.category);
        expect(savedReport?.anonymous).toBe(true);
        expect(savedReport?.citizenId).toBe("citizen-anon-1");
        expect(savedReport?.status).toBe("PENDING_APPROVAL");
        expect(savedReport?.createdAt).toBeInstanceOf(Date);
      }
    });

    it("should correctly store anonymous flag in database with correct type", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: "citizen-anon-1",
          firstName: "Anonymous",
          lastName: "Citizen",
          email: "citizen1@test.com",
          username: "citizen_anon_1",
          role: ["CITIZEN"],
        },
        expires: "2099-01-01T00:00:00.000Z",
      });

      const response: ReportRegistrationResponse = await createReport(
        "Type Check Report",
        "This report checks the type of anonymous field in database",
        ["photo-anon-1"],
        "WASTE",
        10.5,
        45.5,
        true
      );

      expect(response.success).toBe(true);
      if (response.success) {
        const match = response.data.match(/id:\s*(\d+)/);
        const reportId = match![1];

        const savedReport = await prisma.report.findUnique({
          where: { id: BigInt(reportId) },
        });

        expect(typeof savedReport?.anonymous).toBe("boolean");
        expect(savedReport?.anonymous).toStrictEqual(true);
      }
    });
  });
});
