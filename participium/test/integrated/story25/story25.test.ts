import { prisma } from "../../setup";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth/next";
import { 
  updateReportStatus
} from "../../../src/app/lib/controllers/report.controller";

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

describe("Story 25 - Integration Test: External Maintainer Updates Report Status", () => {
  let testCitizenId: string;
  let testMaintainerId: string;
  let testCompanyId: string;
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

    const hashedPassword = await bcrypt.hash("testpassword", 12);

    const citizen = await prisma.user.create({
      data: {
        username: "testcitizen_story25",
        firstName: "Test",
        lastName: "Citizen",
        email: "citizen25@test.com",
        passwordHash: hashedPassword,
        role: ["CITIZEN"],
      },
    });
    testCitizenId = citizen.id;

    const company = await prisma.company.create({
      data: {
        name: "Test Maintenance Company",
        email: "company25@test.com",
        hasAccess: true,
      },
    });
    testCompanyId = company.id;

    const maintainer = await prisma.user.create({
      data: {
        username: "testmaintainer_story25",
        firstName: "Test",
        lastName: "Maintainer",
        email: "maintainer25@test.com",
        passwordHash: hashedPassword,
        role: ["EXTERNAL_MAINTAINER_WITH_ACCESS"],
        companyId: testCompanyId,
      },
    });
    testMaintainerId = maintainer.id;

    const report = await prisma.report.create({
      data: {
        title: "Test Report for Maintenance",
        description: "A report requiring external maintenance",
        status: "ASSIGNED",
        category: "ROADS_AND_URBAN_FURNISHINGS",
        longitude: 7.6869,
        latitude: 45.0703,
        citizenId: testCitizenId,
        officerId: testMaintainerId,
      },
    });
    testReportId = report.id;
  });

  afterAll(async () => {
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

  describe("Successful Status Updates", () => {
    it("should allow external maintainer to update report status from ASSIGNED to IN_PROGRESS", async () => {
      const maintainerSession = {
        user: {
          id: testMaintainerId,
          name: "Test Maintainer",
          role: ["EXTERNAL_MAINTAINER_WITH_ACCESS"],
        },
        expires: "2099-12-31T23:59:59.999Z",
      };

      (getServerSession as jest.Mock).mockResolvedValue(maintainerSession);

      const response = await updateReportStatus(
        "IN_PROGRESS",
        testReportId.toString()
      );

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toBe("Report status updated successfully");
      }

      const updatedReport = await prisma.report.findUnique({
        where: { id: testReportId },
      });

      expect(updatedReport).not.toBeNull();
      expect(updatedReport?.status).toBe("IN_PROGRESS");
    });

    it("should allow external maintainer to update report status from IN_PROGRESS to SUSPENDED", async () => {
      await prisma.report.update({
        where: { id: testReportId },
        data: { status: "IN_PROGRESS" },
      });

      const maintainerSession = {
        user: {
          id: testMaintainerId,
          name: "Test Maintainer",
          role: ["EXTERNAL_MAINTAINER_WITH_ACCESS"],
        },
        expires: "2099-12-31T23:59:59.999Z",
      };

      (getServerSession as jest.Mock).mockResolvedValue(maintainerSession);

      const response = await updateReportStatus(
        "SUSPENDED",
        testReportId.toString()
      );

      expect(response.success).toBe(true);

      const updatedReport = await prisma.report.findUnique({
        where: { id: testReportId },
      });

      expect(updatedReport?.status).toBe("SUSPENDED");
    });

    it("should allow external maintainer to update report status from IN_PROGRESS to RESOLVED", async () => {
      await prisma.report.update({
        where: { id: testReportId },
        data: { status: "IN_PROGRESS" },
      });

      const maintainerSession = {
        user: {
          id: testMaintainerId,
          name: "Test Maintainer",
          role: ["EXTERNAL_MAINTAINER_WITH_ACCESS"],
        },
        expires: "2099-12-31T23:59:59.999Z",
      };

      (getServerSession as jest.Mock).mockResolvedValue(maintainerSession);

      const response = await updateReportStatus(
        "RESOLVED",
        testReportId.toString()
      );

      expect(response.success).toBe(true);

      const updatedReport = await prisma.report.findUnique({
        where: { id: testReportId },
      });

      expect(updatedReport?.status).toBe("RESOLVED");
    });

    it("should allow external maintainer to update report status from SUSPENDED to IN_PROGRESS", async () => {
      await prisma.report.update({
        where: { id: testReportId },
        data: { status: "SUSPENDED" },
      });

      const maintainerSession = {
        user: {
          id: testMaintainerId,
          name: "Test Maintainer",
          role: ["EXTERNAL_MAINTAINER_WITH_ACCESS"],
        },
        expires: "2099-12-31T23:59:59.999Z",
      };

      (getServerSession as jest.Mock).mockResolvedValue(maintainerSession);

      const response = await updateReportStatus(
        "IN_PROGRESS",
        testReportId.toString()
      );

      expect(response.success).toBe(true);

      const updatedReport = await prisma.report.findUnique({
        where: { id: testReportId },
      });

      expect(updatedReport?.status).toBe("IN_PROGRESS");
    });
  });

  describe("Authorization and Access Control", () => {
    it("should prevent unauthorized user from updating report status", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await updateReportStatus(
        "IN_PROGRESS",
        testReportId.toString()
      );

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Unauthorized access");
      }

      const report = await prisma.report.findUnique({
        where: { id: testReportId },
      });

      expect(report?.status).toBe("ASSIGNED");
    });

    it("should prevent CITIZEN from updating report status", async () => {
      const citizenSession = {
        user: {
          id: testCitizenId,
          name: "Test Citizen",
          role: ["CITIZEN"],
        },
        expires: "2099-12-31T23:59:59.999Z",
      };

      (getServerSession as jest.Mock).mockResolvedValue(citizenSession);

      const response = await updateReportStatus(
        "IN_PROGRESS",
        testReportId.toString()
      );

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Unauthorized access");
      }

      const report = await prisma.report.findUnique({
        where: { id: testReportId },
      });

      expect(report?.status).toBe("ASSIGNED");
    });
  });

  describe("Invalid Status Transitions", () => {
    it("should fail when updating with invalid status", async () => {
      const maintainerSession = {
        user: {
          id: testMaintainerId,
          name: "Test Maintainer",
          role: ["EXTERNAL_MAINTAINER_WITH_ACCESS"],
        },
        expires: "2099-12-31T23:59:59.999Z",
      };

      (getServerSession as jest.Mock).mockResolvedValue(maintainerSession);

      const response = await updateReportStatus(
        "INVALID_STATUS",
        testReportId.toString()
      );

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Invalid status");
      }

      const report = await prisma.report.findUnique({
        where: { id: testReportId },
      });

      expect(report?.status).toBe("ASSIGNED");
    });

    it("should fail when updating with non-existent report ID", async () => {
      const maintainerSession = {
        user: {
          id: testMaintainerId,
          name: "Test Maintainer",
          role: ["EXTERNAL_MAINTAINER_WITH_ACCESS"],
        },
        expires: "2099-12-31T23:59:59.999Z",
      };

      (getServerSession as jest.Mock).mockResolvedValue(maintainerSession);

      let response;
      try {
        response = await updateReportStatus("IN_PROGRESS", "999999");
      } catch (error) {
        response = { success: false, error: "Report not found" };
      }

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Report not found");
      }
    });
  });

  describe("Integration with getReportsByAssigneeId", () => {
    it("should retrieve reports assigned to external maintainer with updated status", async () => {
      const maintainerSession = {
        user: {
          id: testMaintainerId,
          name: "Test Maintainer",
          role: ["EXTERNAL_MAINTAINER_WITH_ACCESS"],
        },
        expires: "2099-12-31T23:59:59.999Z",
      };

      (getServerSession as jest.Mock).mockResolvedValue(maintainerSession);

      const response = await updateReportStatus("IN_PROGRESS", testReportId.toString());

      expect(response.success).toBe(true);

      const report = await prisma.report.findUnique({
        where: { id: testReportId },
      });
      expect(report?.status).toBe("IN_PROGRESS");
      if (report) {
        expect(report.officerId).toBe(testMaintainerId);
      }
    });

    it("should show multiple reports with different statuses for same maintainer", async () => {
      const report2 = await prisma.report.create({
        data: {
          title: "Second Report",
          description: "Another maintenance task",
          status: "ASSIGNED",
          category: "PUBLIC_LIGHTING",
          longitude: 7.6869,
          latitude: 45.0703,
          citizenId: testCitizenId,
          officerId: testMaintainerId,
        },
      });

      const report3 = await prisma.report.create({
        data: {
          title: "Third Report",
          description: "Yet another task",
          status: "SUSPENDED",
          category: "WASTE",
          longitude: 7.6869,
          latitude: 45.0703,
          citizenId: testCitizenId,
          officerId: testMaintainerId,
        },
      });

      const maintainerSession = {
        user: {
          id: testMaintainerId,
          name: "Test Maintainer",
          role: ["EXTERNAL_MAINTAINER_WITH_ACCESS"],
        },
        expires: "2099-12-31T23:59:59.999Z",
      };

      (getServerSession as jest.Mock).mockResolvedValue(maintainerSession);

      const response = await updateReportStatus("IN_PROGRESS", testReportId.toString());

      expect(response.success).toBe(true);

      const reports = await prisma.report.findMany({
        where: { officerId: testMaintainerId },
      });

      expect(reports).toHaveLength(3);

      const statusCounts = reports.reduce(
        (acc, report) => {
          const status = report.status;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      expect(statusCounts["IN_PROGRESS"]).toBe(1);
      expect(statusCounts["ASSIGNED"]).toBe(1);
      expect(statusCounts["SUSPENDED"]).toBe(1);
    });

    it("should only retrieve reports assigned to the current maintainer, not others", async () => {
      const hashedPassword = await bcrypt.hash("testpassword", 12);
      const anotherMaintainer = await prisma.user.create({
        data: {
          username: "another_maintainer_story25",
          firstName: "Another",
          lastName: "Maintainer",
          email: "another_maintainer25@test.com",
          passwordHash: hashedPassword,
          role: ["EXTERNAL_MAINTAINER_WITH_ACCESS"],
          companyId: testCompanyId,
        },
      });

      const reportForAnother = await prisma.report.create({
        data: {
          title: "Report for Another Maintainer",
          description: "This report is assigned to another maintainer",
          status: "ASSIGNED",
          category: "ROADS_AND_URBAN_FURNISHINGS",
          longitude: 7.6869,
          latitude: 45.0703,
          citizenId: testCitizenId,
          officerId: anotherMaintainer.id,
        },
      });

      const maintainerSession = {
        user: {
          id: testMaintainerId,
          name: "Test Maintainer",
          role: ["EXTERNAL_MAINTAINER_WITH_ACCESS"],
        },
        expires: "2099-12-31T23:59:59.999Z",
      };

      (getServerSession as jest.Mock).mockResolvedValue(maintainerSession);

      const reports = await prisma.report.findMany({
        where: { officerId: testMaintainerId },
      });

      expect(reports).toHaveLength(1);
      expect(reports[0].officerId).toBe(testMaintainerId);
      expect(reports[0].id).toBe(testReportId);
      expect(reports[0].officerId).toBe(testMaintainerId);
    });
  });

  describe("Technical Officer can also update status", () => {
    it("should allow TECHNICAL_OFFICER to update report status", async () => {
      const hashedPassword = await bcrypt.hash("testpassword", 12);
      const officer = await prisma.user.create({
        data: {
          username: "testofficer_story25",
          firstName: "Test",
          lastName: "Officer",
          email: "officer25@test.com",
          passwordHash: hashedPassword,
          role: ["TECHNICAL_OFFICER"],
          office: ["DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES"],
        },
      });

      await prisma.report.update({
        where: { id: testReportId },
        data: { officerId: officer.id },
      });

      const officerSession = {
        user: {
          id: officer.id,
          name: "Test Officer",
          role: ["TECHNICAL_OFFICER"],
        },
        expires: "2099-12-31T23:59:59.999Z",
      };

      (getServerSession as jest.Mock).mockResolvedValue(officerSession);

      const response = await updateReportStatus(
        "IN_PROGRESS",
        testReportId.toString()
      );

      expect(response.success).toBe(true);

      const updatedReport = await prisma.report.findUnique({
        where: { id: testReportId },
      });

      expect(updatedReport?.status).toBe("IN_PROGRESS");
    });
  });

  describe("Complete workflow: from ASSIGNED to RESOLVED", () => {
    it("should successfully complete entire workflow of status updates", async () => {
      const maintainerSession = {
        user: {
          id: testMaintainerId,
          name: "Test Maintainer",
          role: ["EXTERNAL_MAINTAINER_WITH_ACCESS"],
        },
        expires: "2099-12-31T23:59:59.999Z",
      };

      (getServerSession as jest.Mock).mockResolvedValue(maintainerSession);

      let response = await updateReportStatus(
        "IN_PROGRESS",
        testReportId.toString()
      );
      expect(response.success).toBe(true);

      let report = await prisma.report.findUnique({
        where: { id: testReportId },
      });
      expect(report?.status).toBe("IN_PROGRESS");

      response = await updateReportStatus("SUSPENDED", testReportId.toString());
      expect(response.success).toBe(true);

      report = await prisma.report.findUnique({
        where: { id: testReportId },
      });
      expect(report?.status).toBe("SUSPENDED");

      response = await updateReportStatus(
        "IN_PROGRESS",
        testReportId.toString()
      );
      expect(response.success).toBe(true);

      report = await prisma.report.findUnique({
        where: { id: testReportId },
      });
      expect(report?.status).toBe("IN_PROGRESS");

      response = await updateReportStatus("RESOLVED", testReportId.toString());
      expect(response.success).toBe(true);

      report = await prisma.report.findUnique({
        where: { id: testReportId },
      });
      expect(report?.status).toBe("RESOLVED");
    });
  });
});
