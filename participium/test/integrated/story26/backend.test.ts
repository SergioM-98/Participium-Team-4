import { PrismaClient } from "@prisma/client";
import {
  createComment,
  getReportComments,
} from "@/app/lib/controllers/comment.controller";
import { getServerSession } from "next-auth/next";
import { TestUser } from "@/app/lib/dtos/user.dto";
import { TestReport } from "@/app/lib/dtos/report.dto";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("Comment Backend Integration Tests (Story 26)", () => {
  let prisma: PrismaClient;
  let testTechnicalOfficer: TestUser;
  let testExternalMaintainer: TestUser;
  let testCitizen: TestUser;
  let testReport: TestReport;
  let anotherTechnicalOfficer: TestUser;
  let secondReport: TestReport;

  beforeAll(async () => {
    const setupModule = await import("../../setup");
    prisma = setupModule.prisma;
  });

  beforeEach(async () => {
    await prisma.comment.deleteMany({});
    await prisma.report.deleteMany({});
    await prisma.user.deleteMany({});

    const createdOfficer = await prisma.user.create({
      data: {
        firstName: "John",
        lastName: "Doe",
        email: "john@test.com",
        username: "johndoe",
        role: ["TECHNICAL_OFFICER" as const],
        passwordHash: "hashedpassword",
        office: "DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES",
      },
    });
    testTechnicalOfficer = createdOfficer as TestUser;

    const createdExternalMaintainer = await prisma.user.create({
      data: {
        firstName: "External",
        lastName: "Maintainer",
        email: "external@test.com",
        username: "externalmaintainer",
        role: ["EXTERNAL_MAINTAINER_WITH_ACCESS" as const],
        passwordHash: "hashedpassword",
        office: "DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES",
      },
    });
    testExternalMaintainer = createdExternalMaintainer as TestUser;

    const createdSecondOfficer = await prisma.user.create({
      data: {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@test.com",
        username: "janesmith",
        role: ["TECHNICAL_OFFICER" as const],
        passwordHash: "hashedpassword",
        office: "DEPARTMENT_OF_ENVIRONMENT_MAJOR_PROJECTS_INFRAS_AND_MOBILITY",
      },
    });
    anotherTechnicalOfficer = createdSecondOfficer as TestUser;

    const createdCitizen = await prisma.user.create({
      data: {
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice@test.com",
        username: "alicejohnson",
        role: ["CITIZEN" as const],
        passwordHash: "hashedpassword",
        isVerified: true,
      },
    });
    testCitizen = createdCitizen as TestUser;

    const createdReport = await prisma.report.create({
      data: {
        title: "Test Report",
        description: "A test report for comment testing",
        citizenId: testCitizen.id,
        longitude: 15.087269,
        latitude: 37.502669,
        status: "ASSIGNED",
      },
    });
    testReport = createdReport;

    const createdSecondReport = await prisma.report.create({
      data: {
        title: "Second Test Report",
        description: "Another test report for comment testing",
        citizenId: testCitizen.id,
        longitude: 15.087269,
        latitude: 37.502669,
        status: "ASSIGNED",
      },
    });
    secondReport = createdSecondReport;
  });

  describe("Full Stack Comment Workflows", () => {
    it("should create comment going through all the backend layers for TECHNICAL_OFFICER", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testTechnicalOfficer.id,
          email: testTechnicalOfficer.email,
          role: "TECHNICAL_OFFICER",
        },
      });

      const result = await createComment(
        "Full stack integration test",
        testReport.id,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe("Full stack integration test");
        expect(result.data.author?.firstName).toBe("John");

        const dbComment = await prisma.comment.findUnique({
          where: { id: result.data.id },
          include: { author: true, report: true },
        });

        expect(dbComment).toBeDefined();
        expect(dbComment?.content).toBe("Full stack integration test");
        expect(dbComment?.author.username).toBe("johndoe");
        expect(dbComment?.report.id).toBe(testReport.id);
      }
    });

    it("should create comment going through all the backend layers for EXTERNAL_MAINTAINER_WITH_ACCESS", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testExternalMaintainer.id,
          email: testExternalMaintainer.email,
          role: "EXTERNAL_MAINTAINER_WITH_ACCESS",
        },
      });

      const result = await createComment(
        "Full stack integration test",
        testReport.id,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe("Full stack integration test");
        expect(result.data.author?.firstName).toBe("External");

        const dbComment = await prisma.comment.findUnique({
          where: { id: result.data.id },
          include: { author: true, report: true },
        });

        expect(dbComment).toBeDefined();
        expect(dbComment?.content).toBe("Full stack integration test");
        expect(dbComment?.author.username).toBe("externalmaintainer");
        expect(dbComment?.report.id).toBe(testReport.id);
      }
    });

    it("should retrieve comments through full stack with proper relationships", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testTechnicalOfficer.id,
          email: testTechnicalOfficer.email,
          role: "TECHNICAL_OFFICER",
        },
      });

      await createComment("First comment", testReport.id);
      await delay(10);
      await createComment("Second comment", testReport.id);

      const result = await getReportComments(testReport.id);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0].content).toBe("First comment");
        expect(result.data[1].content).toBe("Second comment");
        expect(result.data[0].author?.username).toBe("johndoe");
        expect(result.data[1].author?.username).toBe("johndoe");

        // Verify database state
        const dbComments = await prisma.comment.findMany({
          where: { reportId: testReport.id },
          orderBy: { createdAt: "asc" },
        });
        expect(dbComments).toHaveLength(2);
        expect(dbComments[0].createdAt.getTime()).toBeLessThanOrEqual(
          dbComments[1].createdAt.getTime(),
        );
      }
    });

    it("should handle authorization", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testCitizen.id,
          email: testCitizen.email,
          role: "CITIZEN",
        },
      });

      const createResult = await createComment(
        "Unauthorized comment",
        testReport.id,
      );
      expect(createResult.success).toBe(false);
      if (!createResult.success) {
        expect(createResult.error).toContain("technical officers");
      }

      // Verify nothing was persisted
      const comments = await prisma.comment.findMany({
        where: { reportId: testReport.id },
      });
      expect(comments).toHaveLength(0);

      // Officer should succeed
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testTechnicalOfficer.id,
          email: testTechnicalOfficer.email,
          role: "TECHNICAL_OFFICER",
        },
      });

      const authorizedResult = await createComment(
        "Authorized comment",
        testReport.id,
      );
      expect(authorizedResult.success).toBe(true);

      // Verify persistence
      const persistedComments = await prisma.comment.findMany({
        where: { reportId: testReport.id },
      });
      expect(persistedComments).toHaveLength(1);
    });

    it("should maintain data integrity across multiple officers and reports", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testTechnicalOfficer.id,
          email: testTechnicalOfficer.email,
          role: "TECHNICAL_OFFICER",
        },
      });

      // Officer 1 creates comments on report 1
      await createComment("Report 1 - Officer 1 comment 1", testReport.id);
      await createComment("Report 1 - Officer 1 comment 2", testReport.id);

      // Switch to officer 2 and create comments on different reports
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: anotherTechnicalOfficer.id,
          email: anotherTechnicalOfficer.email,
          role: "TECHNICAL_OFFICER",
        },
      });

      await createComment("Report 1 - Officer 2 comment", testReport.id);
      await createComment("Report 2 - Officer 2 comment", secondReport.id);

      const report1Comments = await getReportComments(testReport.id);
      const report2Comments = await getReportComments(secondReport.id);

      expect(report1Comments.success).toBe(true);
      expect(report2Comments.success).toBe(true);

      if (report1Comments.success && report2Comments.success) {
        expect(report1Comments.data).toHaveLength(3);
        expect(report2Comments.data).toHaveLength(1);

        // Verify relationships
        const officer1Comments = report1Comments.data.filter(
          (c) => c.author?.username === "johndoe",
        );
        const officer2Comments = report1Comments.data.filter(
          (c) => c.author?.username === "janesmith",
        );

        expect(officer1Comments).toHaveLength(2);
        expect(officer2Comments).toHaveLength(1);

        // Verify database consistency
        const dbComments = await prisma.comment.findMany();
        expect(dbComments).toHaveLength(4);
      }
    });

    it("should handle edge cases: empty content, special characters, long content", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testTechnicalOfficer.id,
          email: testTechnicalOfficer.email,
          role: "TECHNICAL_OFFICER",
        },
      });

      // Empty content
      const emptyResult = await createComment("", testReport.id);
      expect(emptyResult.success).toBe(true);

      // Special characters
      const specialResult = await createComment(
        'Test with "quotes", <html>, & special @#$% chars',
        testReport.id,
      );
      expect(specialResult.success).toBe(true);

      // Long content
      const longResult = await createComment("A".repeat(1000), testReport.id);
      expect(longResult.success).toBe(true);

      // Verify all persisted correctly
      const retrievedResult = await getReportComments(testReport.id);
      expect(retrievedResult.success).toBe(true);

      if (retrievedResult.success) {
        expect(retrievedResult.data).toHaveLength(3);

        const dbComments = await prisma.comment.findMany({
          where: { reportId: testReport.id },
          orderBy: { createdAt: "asc" },
        });

        expect(dbComments[0].content).toBe("");
        expect(dbComments[1].content).toContain("special @#$% chars");
        expect(dbComments[2].content).toBe("A".repeat(1000));
      }
    });

    it("should handle concurrent operations maintaining consistency", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testTechnicalOfficer.id,
          email: testTechnicalOfficer.email,
          role: "TECHNICAL_OFFICER",
        },
      });

      // Create multiple comments concurrently
      const results = await Promise.all([
        createComment("Comment 1", testReport.id),
        createComment("Comment 2", testReport.id),
        createComment("Comment 3", testReport.id),
      ]);

      for (const result of results) {
        expect(result.success).toBe(true);
      }

      // Verify through controller retrieval
      const retrievalResult = await getReportComments(testReport.id);
      expect(retrievalResult.success).toBe(true);

      if (retrievalResult.success) {
        expect(retrievalResult.data).toHaveLength(3);

        // Verify database consistency
        const dbComments = await prisma.comment.findMany({
          where: { reportId: testReport.id },
        });
        expect(dbComments).toHaveLength(3);

        for (const comment of dbComments) {
          expect(comment.authorId).toBe(testTechnicalOfficer.id);
          expect(comment.reportId).toBe(testReport.id);
          expect(comment.createdAt).toBeInstanceOf(Date);
        }
      }
    });

    it("should handle database errors gracefully through full stack", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testTechnicalOfficer.id,
          email: testTechnicalOfficer.email,
          role: "TECHNICAL_OFFICER",
        },
      });

      // Use invalid report ID
      const result = await createComment(
        "Comment on non-existent report",
        BigInt("9999999999999"),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }

      // Verify nothing was persisted
      const comments = await prisma.comment.findMany();
      expect(comments).toHaveLength(0);
    });
  });
});
