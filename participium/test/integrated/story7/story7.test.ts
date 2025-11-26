import { prisma } from "../../setup";
import {
  getApprovedReportsForMap,
  getReportById,
} from "../../../src/app/lib/controllers/reportMap.controller";
import bcrypt from "bcrypt";
import path from "path";
import fs from "fs/promises";

describe("Story 7 - Integration Test: View approved reports on interactive map", () => {
  let testCitizenId: string;
  let testOfficerId: string;
  let testPhotoId: string;
  let approvedReportId: bigint;
  let pendingReportId: bigint;

  beforeEach(async () => {
    // Clean database before each test
    await prisma.report.deleteMany({});
    await prisma.photo.deleteMany({});
    await prisma.user.deleteMany({});
    // Create test citizen
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

    // Create approved report (ASSIGNED status)
    const approvedReport = await prisma.report.create({
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
    approvedReportId = approvedReport.id;

    // Create pending report (should NOT appear on map)
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
    // Cleanup in reverse order of creation
    if (approvedReportId) {
      await prisma.report
        .delete({ where: { id: approvedReportId } })
        .catch(() => {});
    }
    if (pendingReportId) {
      await prisma.report
        .delete({ where: { id: pendingReportId } })
        .catch(() => {});
    }
    if (testPhotoId) {
      await prisma.photo.delete({ where: { id: testPhotoId } }).catch(() => {});
    }
    if (testOfficerId) {
      await prisma.user
        .delete({ where: { id: testOfficerId } })
        .catch(() => {});
    }
    if (testCitizenId) {
      await prisma.user
        .delete({ where: { id: testCitizenId } })
        .catch(() => {});
    }

    // Clean up test image
    const uploadsDir =
      process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
    const testImagePath = path.join(uploadsDir, "test-image-story7.jpg");
    await fs.unlink(testImagePath).catch(() => {});
  });

  describe("Approved Reports Map Display Flow", () => {
    it("should return only approved (ASSIGNED) reports for the map", async () => {
      const result = await getApprovedReportsForMap();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);

      // Find our test approved report
      const approvedReport = result.data?.find(
        (r: any) => r.id === approvedReportId.toString()
      );

      expect(approvedReport).toBeDefined();
      if (approvedReport) {
        expect(approvedReport.title).toBe("Approved Report for Map");
        expect(approvedReport.latitude).toBe(45.0703);
        expect(approvedReport.longitude).toBe(7.6869);
        expect(approvedReport.category).toBe("ROADS_AND_URBAN_FURNISHINGS");
        expect(approvedReport.username).toBe("testcitizen_story7");
      }

      // Verify pending report is NOT in the results
      const pendingReport = result.data?.find(
        (r: any) => r.id === pendingReportId.toString()
      );
      expect(pendingReport).toBeUndefined();
    });

    it("should return reports with required fields for map visualization", async () => {
      const result = await getApprovedReportsForMap();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data && result.data.length > 0) {
        const report = result.data[0];
        expect(report).toHaveProperty("id");
        expect(report).toHaveProperty("title");
        expect(report).toHaveProperty("longitude");
        expect(report).toHaveProperty("latitude");
        expect(report).toHaveProperty("category");
        expect(report).toHaveProperty("username");

        // Validate coordinate ranges
        expect(report.latitude).toBeGreaterThanOrEqual(-90);
        expect(report.latitude).toBeLessThanOrEqual(90);
        expect(report.longitude).toBeGreaterThanOrEqual(-180);
        expect(report.longitude).toBeLessThanOrEqual(180);
      }
    });

    it("should return error for non-existent report id", async () => {
      const result = await getReportById({ id: "999999999" });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should return error for invalid report id format", async () => {
      const result = await getReportById({ id: "invalid-id" });

      expect(result.success).toBe(false);
      // Controller may return "Error retrieving report" if Prisma fails to parse the ID
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe("string");
    });
  });

  describe("Report Details Retrieval Flow", () => {
    it("should return full details of an approved report including photos", async () => {
      const result = await getReportById({ id: approvedReportId.toString() });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.data) {
        expect(result.data.id).toBe(approvedReportId.toString());
        expect(result.data.title).toBe("Approved Report for Map");
        expect(result.data.description).toBe(
          "This is an approved report that should appear on the map"
        );
        expect(result.data.category).toBe("ROADS_AND_URBAN_FURNISHINGS");
        expect(result.data.status).toBe("ASSIGNED");
        expect(result.data.latitude).toBe(45.0703);
        expect(result.data.longitude).toBe(7.6869);
        expect(result.data.username).toBe("testcitizen_story7");
        expect(result.data.createdAt).toBeDefined();
        expect(result.data.photos).toBeDefined();
        expect(Array.isArray(result.data.photos)).toBe(true);

        // Photos may be empty if files don't exist on disk, but array should be defined
        if (result.data.photos.length > 0) {
          // Verify photo is base64 encoded if exists
          const photo = result.data.photos[0];
          expect(photo).toMatch(/^data:image\/(jpeg|png|webp);base64,/);
        }
      }
    });

    it("should retrieve report without officer assignment", async () => {
      // Create a report without officer
      const reportWithoutOfficer = await prisma.report.create({
        data: {
          title: "Report Without Officer",
          description: "This report has no assigned officer",
          category: "PUBLIC_LIGHTING",
          status: "ASSIGNED",
          latitude: 45.08,
          longitude: 7.7,
          citizenId: testCitizenId,
          photos: {
            connect: [{ id: testPhotoId }],
          },
        },
      });

      const result = await getReportById({
        id: reportWithoutOfficer.id.toString(),
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.title).toBe("Report Without Officer");

      // Cleanup
      await prisma.report.delete({ where: { id: reportWithoutOfficer.id } });
    });

    it("should retrieve anonymous reports correctly", async () => {
      // Get anonymous user
      const anonymousUser = await prisma.user.findUnique({
        where: { username: "anonymous" },
      });

      if (anonymousUser) {
        const anonymousReport = await prisma.report.create({
          data: {
            title: "Anonymous Report",
            description: "This is an anonymous report",
            category: "WASTE",
            status: "ASSIGNED",
            latitude: 45.065,
            longitude: 7.685,
            citizenId: anonymousUser.id,
            photos: {
              connect: [{ id: testPhotoId }],
            },
          },
        });

        const result = await getReportById({
          id: anonymousReport.id.toString(),
        });

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data?.username).toBe("anonymous");

        // Cleanup
        await prisma.report.delete({ where: { id: anonymousReport.id } });
      }
    });
  });

  describe("Map interaction scenarios", () => {
    it("should return multiple reports in the same geographic area for clustering", async () => {
      // Create multiple reports in close proximity
      const report1 = await prisma.report.create({
        data: {
          title: "Cluster Report 1",
          description: "First report in cluster",
          category: "ROADS_AND_URBAN_FURNISHINGS",
          status: "ASSIGNED",
          latitude: 45.07,
          longitude: 7.687,
          citizenId: testCitizenId,
          photos: { connect: [{ id: testPhotoId }] },
        },
      });

      const report2 = await prisma.report.create({
        data: {
          title: "Cluster Report 2",
          description: "Second report in cluster",
          category: "PUBLIC_LIGHTING",
          status: "ASSIGNED",
          latitude: 45.0701,
          longitude: 7.6871,
          citizenId: testCitizenId,
          photos: { connect: [{ id: testPhotoId }] },
        },
      });

      const result = await getApprovedReportsForMap();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // Find both reports
      const clusterReports = result.data?.filter(
        (r: any) =>
          r.id === report1.id.toString() || r.id === report2.id.toString()
      );

      expect(clusterReports?.length).toBe(2);

      // Cleanup
      await prisma.report.delete({ where: { id: report1.id } });
      await prisma.report.delete({ where: { id: report2.id } });
    });

    it("should return reports with different categories", async () => {
      const result = await getApprovedReportsForMap();

      expect(result.success).toBe(true);

      if (result.data && result.data.length > 0) {
        const categories = result.data.map((r: any) => r.category);
        const uniqueCategories = new Set(categories);

        // Verify we have valid categories
        uniqueCategories.forEach((cat) => {
          expect(typeof cat).toBe("string");
          expect(cat.length).toBeGreaterThan(0);
        });
      }
    });
  });
});
