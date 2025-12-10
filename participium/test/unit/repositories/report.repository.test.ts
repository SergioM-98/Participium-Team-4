import { ReportRepository } from "../../../src/app/lib/repositories/report.repository";
import { ReportRequest } from "../../../src/app/lib/dtos/report.dto";

// Mock Prisma
jest.mock("@/db/db", () => ({
  prisma: {
    report: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
  },
}));

const mockedPrisma = jest.requireMock("@/db/db").prisma;

describe("ReportRepository", () => {
  let reportRepository: ReportRepository;

  beforeEach(() => {
    reportRepository = ReportRepository.getInstance();
    jest.clearAllMocks();
  });

  describe("createReport", () => {
    it("should create a new report", async () => {
      mockedPrisma.report.create.mockResolvedValue({ id: 1 });
      const response = await reportRepository.createReport(
        "title",
        "desc",
        [],
        "OTHER",
        0,
        0,
        "1"
      );
      expect(response.success).toBe(true);
    });
  });

  // ... (keep existing tests for getOfficerWithLeastReports, assignReportToOfficer, rejectReport, getReportById, getApprovedReports, getReportsByOfficerId) ...

  describe("getReportsByMaintainerId - Story 25", () => {
    it("should retrieve reports for a specific maintainer", async () => {
      const mockReports = [
        {
          id: BigInt(1),
          title: "Maintainer Report",
          maintainerId: "m1",
          status: "ASSIGNED",
          photos: [],
          citizen: { username: "user" },
        },
      ];

      mockedPrisma.report.findMany.mockResolvedValue(mockReports);

      const response = await reportRepository.getReportsByMaintainerId("m1");

      expect(mockedPrisma.report.findMany).toHaveBeenCalledWith({
        where: { maintainerId: "m1" },
        include: expect.anything(),
      });
      expect(response).toEqual(mockReports);
    });

    it("should return empty array if no reports found", async () => {
      mockedPrisma.report.findMany.mockResolvedValue([]);
      const response = await reportRepository.getReportsByMaintainerId("m1");
      expect(response).toEqual([]);
    });
  });
});
