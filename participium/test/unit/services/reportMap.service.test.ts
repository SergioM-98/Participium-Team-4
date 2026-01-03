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

    it("should retrieve specific reports for CITIZEN role (approved + own pending/unapproved)", async () => {
      // Arrange
      (ReportRepository.getInstance as jest.Mock).mockReturnValue(
        mockReportMapRepository
      );

      const mockApproved = [mockReportArray[0]];
      const mockPending = [{ id: "3", status: "PENDING_APPROVAL" }];
      const mockUnapproved = [{ id: "4", status: "REJECTED" }];

      mockReportMapRepository.getApprovedReports.mockResolvedValue({
        success: true,
        data: mockApproved,
      });
      mockReportMapRepository.getPendingApprovalReportsByCitizenId.mockResolvedValue(
        { success: true, data: mockPending }
      );
      mockReportMapRepository.getUnapprovedReportsByCitizenId.mockResolvedValue(
        { success: true, data: mockUnapproved }
      );

      const instance = ReportMapService.getInstance();
      const userId = "user123";
      const roles = ["CITIZEN"];

      // Act
      const response = await instance.getReportsForMap(userId, roles);

      // Assert
      expect(response.success).toBe(true);
      expect(mockReportMapRepository.getApprovedReports).toHaveBeenCalled(); // Should still fetch approved
      // Verify specific citizen methods were called
      expect(
        mockReportMapRepository.getPendingApprovalReportsByCitizenId
      ).toHaveBeenCalledWith(userId);
      expect(
        mockReportMapRepository.getUnapprovedReportsByCitizenId
      ).toHaveBeenCalledWith(userId);

      if (response.success && response.data) {
        expect(response.data).toHaveLength(3); // 1 approved + 1 pending + 1 unapproved
      }
    });

    it("should call getPublicApprovedReports correctly", async () => {
      // Arrange
      (ReportRepository.getInstance as jest.Mock).mockReturnValue(
        mockReportMapRepository
      );
      mockReportMapRepository.getApprovedReports.mockResolvedValue({
        success: true,
        data: mockReportArray,
      });

      const instance = ReportMapService.getInstance();

      // Act
      const response = await instance.getPublicApprovedReports();

      // Assert
      expect(response.success).toBe(true);
      expect(mockReportMapRepository.getApprovedReports).toHaveBeenCalled();
      if (response.success && response.data) {
        expect(response.data).toEqual(mockReportArray);
      }
    });
  });
});
