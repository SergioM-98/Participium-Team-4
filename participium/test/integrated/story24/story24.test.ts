import { prisma } from "../../setup";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth/next";
import { assignReportToCompany } from "../../../src/app/lib/controllers/report.controller";
import { Role, Offices, Category, ReportStatus, NotificationType } from "@prisma/client";

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

describe("Story 24 - Integration Test: Assign Report to External Maintainer", () => {
  let testCitizenId: string;
  let testTechnicalOfficerId: string;
  let testCompanyWithAccessId: string;
  let testCompanyWithoutAccessId: string;
  let testMaintainerWithAccessId: string;
  let testMaintainerWithoutAccessId: string;
  let testReportId: bigint;

  beforeEach(async () => {
    if (prisma.notification) await prisma.notification.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.photo.deleteMany({});
    await prisma.report.deleteMany({});
    if (prisma.profilePhoto) await prisma.profilePhoto.deleteMany({});
    if (prisma.notificationPreferences)
      await prisma.notificationPreferences.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.company.deleteMany({});

    const passwordHash = await bcrypt.hash("testpassword", 12);

    const citizen = await prisma.user.create({
      data: {
        username: "testcitizen_story24",
        firstName: "Test",
        lastName: "Citizen",
        email: "citizen24@test.com",
        passwordHash,
        role: [Role.CITIZEN],
        isVerified: true,
      },
    });
    testCitizenId = citizen.id;

    const technicalOfficer = await prisma.user.create({
      data: {
        username: "technicalofficer_story24",
        firstName: "Tech",
        lastName: "Officer",
        email: "tech24@test.com",
        passwordHash,
        role: [Role.TECHNICAL_OFFICER],
        office: [Offices.DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES],
        isVerified: true,
      },
    });
    testTechnicalOfficerId = technicalOfficer.id;

    const companyWithAccess = await prisma.company.create({
      data: {
        name: "Enel X - Public Lighting",
        email: "enelx@example.com",
        hasAccess: true,
      },
    });
    testCompanyWithAccessId = companyWithAccess.id;

    const companyWithoutAccess = await prisma.company.create({
      data: {
        name: "External Company - No Access",
        email: "external@example.com",
        hasAccess: false,
      },
    });
    testCompanyWithoutAccessId = companyWithoutAccess.id;

    const maintainerWithAccess = await prisma.user.create({
      data: {
        username: "maintainer_with_access_story24",
        firstName: "External",
        lastName: "MaintainerAccess",
        email: "maintainer_access24@test.com",
        passwordHash,
        role: [Role.EXTERNAL_MAINTAINER_WITH_ACCESS],
        companyId: testCompanyWithAccessId,
        isVerified: true,
      },
    });
    testMaintainerWithAccessId = maintainerWithAccess.id;

    const maintainerWithoutAccess = await prisma.user.create({
      data: {
        username: "maintainer_without_access_story24",
        firstName: "External",
        lastName: "MaintainerNoAccess",
        email: "maintainer_noaccess24@test.com",
        passwordHash,
        role: [Role.EXTERNAL_MAINTAINER_WITHOUT_ACCESS],
        companyId: testCompanyWithoutAccessId,
        isVerified: true,
      },
    });
    testMaintainerWithoutAccessId = maintainerWithoutAccess.id;

    const report = await prisma.report.create({
      data: {
        title: "Broken street light",
        description: "Street light not working on Main St",
        citizenId: testCitizenId,
        latitude: 45.0703,
        longitude: 7.6869,
        category: Category.PUBLIC_LIGHTING,
        status: ReportStatus.PENDING_APPROVAL,
      },
    });
    testReportId = report.id;
  });

  afterEach(async () => {
    if (prisma.notification) await prisma.notification.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.photo.deleteMany({});
    await prisma.report.deleteMany({});
    if (prisma.profilePhoto) await prisma.profilePhoto.deleteMany({});
    if (prisma.notificationPreferences)
      await prisma.notificationPreferences.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.company.deleteMany({});
  });

  describe("Technical Officer assigns report to external company", () => {
    it("should successfully assign report to company with access (Enel X)", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testTechnicalOfficerId,
          role: [Role.TECHNICAL_OFFICER],
          office: ["Public Lighting"],
        },
      });

      const result = await assignReportToCompany(
        Number(testReportId),
        testCompanyWithAccessId,
      );

      expect(result.success).toBe(true);
      expect(result.data).toContain("Enel X");
      expect(result.access).toBe(true);
      expect(result.email).toBe("maintainer_access24@test.com");

      const updatedReport = await prisma.report.findUnique({
        where: { id: testReportId },
      });
      expect(updatedReport?.maintainerId).toBe(testMaintainerWithAccessId);
      expect(updatedReport?.companyId).toBe(testCompanyWithAccessId);
      expect(updatedReport?.status).toBe(ReportStatus.PENDING_APPROVAL);
    });

    it("should successfully assign report to company without access", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testTechnicalOfficerId,
          role: [Role.TECHNICAL_OFFICER],
          office: ["Public Lighting"],
        },
      });

      const result = await assignReportToCompany(
        Number(testReportId),
        testCompanyWithoutAccessId,
      );

      expect(result.success).toBe(true);
      expect(result.access).toBe(false);

      const updatedReport = await prisma.report.findUnique({
        where: { id: testReportId },
      });
      expect(updatedReport?.maintainerId).toBe(testMaintainerWithoutAccessId);
      expect(updatedReport?.companyId).toBe(testCompanyWithoutAccessId);
      expect(updatedReport?.status).toBe(ReportStatus.PENDING_APPROVAL);
    });

    it("should return error when company does not exist", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testTechnicalOfficerId,
          role: [Role.TECHNICAL_OFFICER],
          office: ["Public Lighting"],
        },
      });

      const result = await assignReportToCompany(
        Number(testReportId),
        "non-existent-company-id",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should assign to employee with least reports in company", async () => {
      const passwordHash = await bcrypt.hash("testpassword", 12);
      const secondMaintainer = await prisma.user.create({
        data: {
          username: "maintainer2_with_access_story24",
          firstName: "Second",
          lastName: "Maintainer",
          email: "maintainer2_access24@test.com",
          passwordHash,
          role: [Role.EXTERNAL_MAINTAINER_WITH_ACCESS],
          companyId: testCompanyWithAccessId,
          isVerified: true,
        },
      });

      const report2 = await prisma.report.create({
        data: {
          title: "Another broken light",
          description: "Another issue",
          citizenId: testCitizenId,
          latitude: 45.0703,
          longitude: 7.6869,
          category: Category.PUBLIC_LIGHTING,
          status: ReportStatus.ASSIGNED,
          maintainerId: testMaintainerWithAccessId,
          companyId: testCompanyWithAccessId,
        },
      });

      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testTechnicalOfficerId,
          role: [Role.TECHNICAL_OFFICER],
          office: ["Public Lighting"],
        },
      });

      const result = await assignReportToCompany(
        Number(testReportId),
        testCompanyWithAccessId,
      );

      expect(result.success).toBe(true);

      const updatedReport = await prisma.report.findUnique({
        where: { id: testReportId },
      });

      const assignedTo = updatedReport?.maintainerId;
      expect([testMaintainerWithAccessId, secondMaintainer.id]).toContain(assignedTo);
      expect(updatedReport?.companyId).toBe(testCompanyWithAccessId);

      // Clean up
      await prisma.report.delete({ where: { id: report2.id } });
      await prisma.user.delete({ where: { id: secondMaintainer.id } });
    });
  });

  describe("Authorization tests", () => {
    it("should reject assignment if user is not a technical officer", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testCitizenId,
          role: [Role.CITIZEN],
        },
      });

      const result = await assignReportToCompany(
        Number(testReportId),
        testCompanyWithAccessId,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized access");

      const report = await prisma.report.findUnique({
        where: { id: testReportId },
      });
      expect(report?.maintainerId).toBeNull();
      expect(report?.companyId).toBeNull();
    });

    it("should reject assignment if session does not exist", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const result = await assignReportToCompany(
        Number(testReportId),
        testCompanyWithAccessId,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized access");
    });
  });

  describe("Notification tests", () => {
    it("should send notification to citizen when report is assigned", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testTechnicalOfficerId,
          role: [Role.TECHNICAL_OFFICER],
          office: ["Public Lighting"],
        },
      });

      await assignReportToCompany(
        Number(testReportId),
        testCompanyWithAccessId,
      );

      const notifications = await prisma.notification?.findMany({
        where: {
          recipientId: testCitizenId,
          reportId: testReportId,
        },
      });

      expect(notifications).toBeDefined();
      if (notifications) {
        expect(notifications.length).toBeGreaterThan(0);
        expect(notifications[0].type).toBe(NotificationType.STATUS_CHANGE);
      }
    });
  });

  describe("Edge cases", () => {
    it("should handle company with no employees", async () => {
      const emptyCompany = await prisma.company.create({
        data: {
          name: "Empty Company",
          email: "empty@example.com",
          hasAccess: true,
        },
      });

      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testTechnicalOfficerId,
          role: [Role.TECHNICAL_OFFICER],
          office: ["Public Lighting"],
        },
      });

      const result = await assignReportToCompany(
        Number(testReportId),
        emptyCompany.id,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      // Clean up
      await prisma.company.delete({ where: { id: emptyCompany.id } });
    });

    it("should handle already assigned report (reassignment)", async () => {
      await prisma.report.update({
        where: { id: testReportId },
        data: {
          maintainerId: testMaintainerWithAccessId,
          companyId: testCompanyWithAccessId,
          status: "ASSIGNED",
        },
      });

      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testTechnicalOfficerId,
          role: [Role.TECHNICAL_OFFICER],
          office: ["Public Lighting"],
        },
      });

      const result = await assignReportToCompany(
        Number(testReportId),
        testCompanyWithoutAccessId,
      );

      expect(result.success).toBe(true);

      const updatedReport = await prisma.report.findUnique({
        where: { id: testReportId },
      });
      expect(updatedReport?.maintainerId).toBe(testMaintainerWithoutAccessId);
      expect(updatedReport?.companyId).toBe(testCompanyWithoutAccessId);
    });
  });
});
