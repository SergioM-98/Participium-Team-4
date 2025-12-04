import { prisma } from "../../setup";
import { getReportsByAssigneeId } from "../../../src/app/lib/controllers/report.controller";
import bcrypt from "bcrypt";
import path from "path";
import fs from "fs/promises";

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

import { getServerSession } from "next-auth/next";

describe("Story 8 - Integration Test: View approved reports of a specific officer", () => {
  let testCitizenId: string;
  let testOfficerId: string;
  let testOfficerId2: string;
  let testPhotoId: string;
  let approvedReportOneId: bigint;
  let approvedReportTwoId: bigint;
  let approvedReportThreeId: bigint;
  let pendingReportId: bigint;

  beforeEach(async () => {
    // Clean database before each test
    await prisma.report.deleteMany({});
    await prisma.photo.deleteMany({});
    await prisma.user.deleteMany({});
    // Create test citizens
    const hashedPassword = await bcrypt.hash("testpassword", 12);
    const citizen = await prisma.user.create({
      data: {
        username: "testcitizen_story7",
        firstName: "Test",
        lastName: "Citizen",
        passwordHash: hashedPassword,
        role: "CITIZEN",
      },
    });
    testCitizenId = citizen.id;

    // Create test officer
    const officer = await prisma.user.create({
      data: {
        username: "testofficer_story7",
        firstName: "Test",
        lastName: "Officer",
        passwordHash: hashedPassword,
        role: "TECHNICAL_OFFICER",
        office: "DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES",
      },
    });
    testOfficerId = officer.id;

    // Create second test officer
    const officer2 = await prisma.user.create({
      data: {
        username: "testofficer2_story7",
        firstName: "Test2",
        lastName: "Officer2",
        passwordHash: hashedPassword,
        role: "TECHNICAL_OFFICER",
        office: "DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES",
      },
    });
    testOfficerId2 = officer2.id;

    // Create test photo
    const photo = await prisma.photo.create({
      data: {
        url: "test-image-story7.jpg",
        size: BigInt(1024),
        offset: BigInt(0),
        filename: "test-image-story7.jpg",
      },
    });
    testPhotoId = photo.id;

    // Create approved reports (ASSIGNED status)
    const approvedReportOne = await prisma.report.create({
      data: {
        title: "Approved Report for Map",
        description: "This is an approved report that should appear on the map",
        category: "ROADS_AND_URBAN_FURNISHINGS",
        status: "ASSIGNED",
        latitude: 45.0703,
        longitude: 7.6869,
        citizenId: testCitizenId,
        officerId: testOfficerId,
        photos: {
          connect: [{ id: testPhotoId }],
        },
      },
    });
    approvedReportOneId = approvedReportOne.id;

    const approvedReportTwo = await prisma.report.create({
      data: {
        title: "Approved Report for Map",
        description: "This is an approved report that should appear on the map",
        category: "ROADS_AND_URBAN_FURNISHINGS",
        status: "ASSIGNED",
        latitude: 45.0703,
        longitude: 7.6869,
        citizenId: testCitizenId,
        officerId: testOfficerId2, // Assign to different officer
        photos: {
          connect: [{ id: testPhotoId }],
        },
      },
    });
    approvedReportTwoId = approvedReportTwo.id;

    const approvedReportThree = await prisma.report.create({
      data: {
        title: "Approved Report for Map",
        description: "This is an approved report that should appear on the map",
        category: "ROADS_AND_URBAN_FURNISHINGS",
        status: "ASSIGNED",
        latitude: 45.0703,
        longitude: 7.6869,
        citizenId: testCitizenId,
        officerId: testOfficerId,
        photos: {
          connect: [{ id: testPhotoId }],
        },
      },
    });
    approvedReportThreeId = approvedReportThree.id;

    // Create pending report
    const pendingReport = await prisma.report.create({
      data: {
        title: "Pending Report Not On Map",
        description: "This report is pending and should not appear",
        category: "WASTE",
        status: "PENDING_APPROVAL",
        latitude: 45.075,
        longitude: 7.69,
        citizenId: testCitizenId,
        photos: {
          connect: [{ id: testPhotoId }],
        },
      },
    });
    pendingReportId = pendingReport.id;

    // Ensure test image exists in uploads directory
    const uploadsDir =
      process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");

    // Create directory if it doesn't exist
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    const testImagePath = path.join(uploadsDir, "test-image-story7.jpg");
    try {
      await fs.access(testImagePath);
    } catch {
      // Create a minimal 1x1 PNG if it doesn't exist
      const minimalPng = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64"
      );
      await fs.writeFile(testImagePath, minimalPng);
    }
  });

  afterAll(async () => {
    await prisma.report.deleteMany({});
    await prisma.photo.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe("Approved Reports Map Display Flow", () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testOfficerId,
          name: "Test Officer",
          role: "TECHNICAL_OFFICER",
        },
        expires: "2024-12-31T23:59:59.999Z",
      });
    });

    it("should return only approved (ASSIGNED) reports to the officer", async () => {
      const result = await getReportsByAssigneeId();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data?.length).toBe(2); // Only 2 reports assigned to this officer
        expect(result.data?.every((r) => r.status === "assigned")).toBe(true);
        result.data?.forEach((r) => {
          expect(r.officerId).toBe(testOfficerId);
        });
        result.data?.forEach((r) => {
          expect([
            approvedReportOneId.toString(),
            approvedReportThreeId.toString(),
          ]).toContain(r.id);
        });
      }
    });

    it("should not return pending reports to the officer", async () => {
      const result = await getReportsByAssigneeId();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data?.every((r) => r.status !== "PENDING_APPROVAL")).toBe(
          true
        );
      }
    });

    it("should give no reports for non existing officer ID", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: "non-existing-officer-id",
          role: "TECHNICAL_OFFICER",
        },
        expires: "2024-12-31T23:59:59.999Z",
      });
      const result = await getReportsByAssigneeId();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data?.length).toBe(0); // No reports for non-existing officer
      }
    });
  });
});
