import { ReportRepository } from "../../../src/app/lib/repositories/report.repository";
import { ReportRetrievalService } from "../../../src/app/lib/services/reportRetrieval.service";

const mockRepository = {
  getReportsByOfficerId: jest.fn(),
  getReportsByMaintainerId: jest.fn(), // Added this
};

jest.mock("@/app/lib/repositories/report.repository", () => {
  return {
    ReportRepository: {
      getInstance: jest.fn(),
    },
  };
});

describe("ReportRetrievalService", () => {
  let reportService: ReportRetrievalService;

  beforeEach(() => {
    (ReportRepository.getInstance as jest.Mock).mockReturnValue(mockRepository);
    reportService = ReportRetrievalService.getInstance();
    jest.clearAllMocks();
  });

  describe("retrieveReportsByOfficerId - Story 4", () => {
    it("should call repository's getReportsByOfficerId method", async () => {
      mockRepository.getReportsByOfficerId.mockResolvedValue([
        {
          id: 1,
          title: "Report 1",
          description: "Desc",
          photos: [],
          category: "WATER",
          longitude: 0,
          latitude: 0,
          citizenId: 1,
          officerId: 2,
          citizen: { username: "citizen1" },
          createdAt: new Date(),
          status: "PENDING",
        },
      ]);

      const response = await reportService.retrieveReportsByOfficerId("1");

      expect(response.success).toBe(true);
      expect(mockRepository.getReportsByOfficerId).toHaveBeenCalledWith("1");
      if (response.success) {
        expect(response.data.length).toBe(1);
      }
    });
  });

  describe("retrieveReportsByMaintainerId - Story 25", () => {
    it("should call repository's getReportsByMaintainerId and map data", async () => {
      const dbData = [
        {
          id: BigInt(100),
          title: "Fix Wiring",
          description: "Exposed wires",
          photos: [{ filename: "wire.jpg" }],
          category: "ELECTRICITY",
          longitude: 10,
          latitude: 20,
          citizenId: BigInt(5),
          officerId: null,
          companyId: "comp1",
          citizen: { username: "citizen1" },
          createdAt: new Date(),
          status: "ASSIGNED",
        },
      ];

      mockRepository.getReportsByMaintainerId.mockResolvedValue(dbData);

      const response = await reportService.retrieveReportsByMaintainerId(
        "maintainer1"
      );

      expect(response.success).toBe(true);
      expect(mockRepository.getReportsByMaintainerId).toHaveBeenCalledWith(
        "maintainer1"
      );

      if (response.success) {
        expect(response.data.length).toBe(1);
        expect(response.data[0].id).toBe("100"); // Check BigInt conversion
        expect(response.data[0].status).toBe("assigned"); // Check normalization
      }
    });
  });
});
