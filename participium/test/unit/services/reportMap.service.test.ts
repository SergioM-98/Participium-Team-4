import { ReportRepository } from "../../../src/app/lib/repositories/report.repository";
import { ReportMapService } from "../../../src/app/lib/services/reportMap.service";

const mockReportMapRepository = {
  getApprovedReports: jest.fn(),
  getReportById: jest.fn(),
  getPendingApprovalReports: jest.fn(),
  getPendingApprovalReportsByCitizenId: jest.fn(),
  getUnapprovedReports: jest.fn(),
  getUnapprovedReportsByCitizenId: jest.fn(),
};

jest.mock("@/app/lib/repositories/report.repository", () => {
  return {
    ReportRepository: {
      getInstance: jest.fn(),
    },
  };
});

describe("ReportMapService Story 7", () => {
  const mockReportArray = [
    {
      id: "1",
      title: "Sample Title",
      longitude: 7.693,
      latitude: 45.0682,
      category: "ARCHITECTURAL_BARRIERS",
      username: "SampleUser",
    },
    {
      id: "2",
      title: "Sample Title 2",
      longitude: 7.693,
      latitude: 45.0682,
      category: "WATER_SUPPLY",
      username: "SampleUser",
    },
  ];

  const mockSingleReport = {
    id: "1",
    title: "Sample Title",
    description: "Sample Description",
    longitude: 7.693,
    latitude: 45.0682,
    createdAt: new Date().toISOString(),
    category: "ARCHITECTURAL_BARRIERS",
    status: "APPROVED",
    username: "SampleUser",
    photos: ["", ""],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("reportMapService unit tests", () => {
    it("should retrieve all approved reports to the user", async () => {
      (ReportRepository.getInstance as jest.Mock).mockReturnValue(
        mockReportMapRepository
      );
      mockReportMapRepository.getApprovedReports.mockResolvedValue({
        success: true,
        data: mockReportArray,
      });
      mockReportMapRepository.getPendingApprovalReports.mockResolvedValue({
        success: true,
        data: [],
      });
      mockReportMapRepository.getUnapprovedReports.mockResolvedValue({
        success: true,
        data: [],
      });

      const instance = ReportMapService.getInstance();

      const response = await instance.getReportsForMap();

      expect(response.success).toBe(true);
      expect(mockReportMapRepository.getApprovedReports).toHaveBeenCalled();
      expect(ReportRepository.getInstance).toHaveBeenCalled();
      if (response.success) {
        expect(response.data).toEqual(mockReportArray);
      }
    });
    it("should retrieve no approved reports to the user", async () => {
      (ReportRepository.getInstance as jest.Mock).mockReturnValue(
        mockReportMapRepository
      );
      mockReportMapRepository.getApprovedReports.mockResolvedValue({
        success: true,
        data: [],
      });
      mockReportMapRepository.getPendingApprovalReports.mockResolvedValue({
        success: true,
        data: [],
      });
      mockReportMapRepository.getUnapprovedReports.mockResolvedValue({
        success: true,
        data: [],
      });
      const instance = ReportMapService.getInstance();
      const response = await instance.getReportsForMap();
      expect(response.success).toBe(true);
      expect(response.data).toEqual([]);
      expect(mockReportMapRepository.getApprovedReports).toHaveBeenCalled();
    });
    it("should retrieve one approved report - without photos - to the user", async () => {
      (ReportRepository.getInstance as jest.Mock).mockReturnValue(
        mockReportMapRepository
      );
      mockReportMapRepository.getReportById.mockResolvedValue({
        success: true,
        data: mockSingleReport,
      });

      const instance = ReportMapService.getInstance();

      const response = await instance.getReportById("1");

      expect(response.success).toBe(true);
      expect(mockReportMapRepository.getReportById).toHaveBeenCalled();
      if (response.success) {
        expect(response.data).toBe(mockSingleReport);
      }
    });
    it("should propagate error if report not found", async () => {
      (ReportRepository.getInstance as jest.Mock).mockReturnValue(
        mockReportMapRepository
      );
      mockReportMapRepository.getReportById.mockResolvedValue({
        success: false,
        error: "Report not found",
      });

      const instance = ReportMapService.getInstance();

      const response = await instance.getReportById("1");

      expect(mockReportMapRepository.getReportById).toHaveBeenCalled();
      expect(response.success).toBe(false);
      expect(response.error).toBe("Report not found");
    });

    it("should retrieve reports for maintainer (non-citizen flow)", async () => {
      (ReportRepository.getInstance as jest.Mock).mockReturnValue(
        mockReportMapRepository
      );

      // Mock repo responses for the "else" block logic
      mockReportMapRepository.getApprovedReports.mockResolvedValue({
        success: true,
        data: [{ id: "1", title: "Approved" }],
      });
      mockReportMapRepository.getPendingApprovalReports.mockResolvedValue({
        success: true,
        data: [{ id: "2", title: "Pending" }],
      });
      mockReportMapRepository.getUnapprovedReports.mockResolvedValue({
        success: true,
        data: [{ id: "3", title: "Unapproved" }],
      });

      const instance = ReportMapService.getInstance();

      // Call with Maintainer role
      const response = await instance.getReportsForMap("maintainer1", [
        "EXTERNAL_MAINTAINER_WITH_ACCESS",
      ]);

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toHaveLength(3);
      }

      // VERIFY: Should call the general methods (from the 'else' block)
      expect(mockReportMapRepository.getApprovedReports).toHaveBeenCalled();
      expect(
        mockReportMapRepository.getPendingApprovalReports
      ).toHaveBeenCalledWith("PENDING_APPROVAL");
      expect(mockReportMapRepository.getUnapprovedReports).toHaveBeenCalled();

      // VERIFY: Should NOT call citizen-specific methods
      expect(
        mockReportMapRepository.getPendingApprovalReportsByCitizenId
      ).not.toHaveBeenCalled();
      expect(
        mockReportMapRepository.getUnapprovedReportsByCitizenId
      ).not.toHaveBeenCalled();
    });
  });
});
