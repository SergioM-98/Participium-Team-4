import { ReportRepository } from "../../../src/app/lib/repositories/report.repository";
import { ReportRetrievalService } from "../../../src/app/lib/services/reportRetrieval.service";

const mockRepository = {
  getReportsByOfficerId: jest.fn(),
  getReportsByMaintainerId: jest.fn(),
};

jest.mock("@/app/lib/repositories/report.repository", () => {
  return {
    ReportRepository: {
      getInstance: jest.fn(),
    },
  };
});

describe("Report service Story 4", () => {
  let reportService: ReportRetrievalService;

  beforeEach(() => {});
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("retrieveReportsByOfficerId", () => {
    it("should call repository's retrieveReportsByOfficerId method and return the approved reports", async () => {
      (ReportRepository.getInstance as jest.Mock).mockReturnValue(
        mockRepository
      );
      mockRepository.getReportsByOfficerId.mockResolvedValue([
        {
          id: 1,
          title: "Report 1",
          description: "Desc 1",
          photos: [],
          category: "WATER_SUPPLY",
          longitude: 0,
          latitude: 0,
          citizenId: 1,
          officerId: 2,
          citizen: { username: "citizen1" },
          createdAt: new Date(),
          status: "PENDING",
        },
        {
          id: 2,
          title: "Report 2",
          description: "Desc 2",
          photos: [],
          category: "ELECTRICITY",
          longitude: 1,
          latitude: 1,
          citizenId: 3,
          officerId: 2,
          citizen: { username: "citizen2" },
          createdAt: new Date(),
          status: "IN_PROGRESS",
        },
      ]);

      reportService = ReportRetrievalService.getInstance();
      const response = await reportService.retrieveReportsByOfficerId("1");

      expect(response.success).toBe(true);
      expect(mockRepository.getReportsByOfficerId).toHaveBeenCalled();
      expect(ReportRepository.getInstance).toHaveBeenCalled();
      if (response.success) {
        expect(response.data.length).toBe(2);
      }
    });
  });

  describe("retrieveReportsByMaintainerId", () => {
    it("should call repository and map data correctly", async () => {
      (ReportRepository.getInstance as jest.Mock).mockReturnValue(
        mockRepository
      );

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

      reportService = ReportRetrievalService.getInstance();
      const response = await reportService.retrieveReportsByMaintainerId(
        "maintainer1"
      );

      expect(response.success).toBe(true);
      expect(mockRepository.getReportsByMaintainerId).toHaveBeenCalledWith(
        "maintainer1"
      );

      if (response.success) {
        expect(response.data.length).toBe(1);
        expect(response.data[0].id).toBe("100"); // BigInt check
        expect(response.data[0].status).toBe("assigned"); // Normalization check
        expect(response.data[0].photos).toEqual(["wire.jpg"]); // Photo mapping check
      }
    });

    it("should return empty list if repository returns empty", async () => {
      (ReportRepository.getInstance as jest.Mock).mockReturnValue(
        mockRepository
      );
      mockRepository.getReportsByMaintainerId.mockResolvedValue([]);

      reportService = ReportRetrievalService.getInstance();
      const response = await reportService.retrieveReportsByMaintainerId(
        "maintainer1"
      );

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toEqual([]);
      }
    });
  });
});
