import { ReportRepository } from "../../../src/app/lib/repositories/report.repository";
import { ReportMapService } from "../../../src/app/lib/services/reportMap.service";

const mockReportMapRepository = {
    getApprovedReports: jest.fn(),
    getReportById: jest.fn(),
};

jest.mock('@/app/lib/repositories/report.repository', () => {
  return {
    ReportRepository: {
      getInstance: jest.fn(),
    },
  };
});

describe('ReportMapService Story 7', () => {

    const mockReportArray = [{
        id: "1",
        title: "Sample Title",
        longitude: 7.6930,
        latitude: 45.0682,
        category: "ARCHITECTURAL_BARRIERS",
        username: "SampleUser"
    },
    {
        id: "2",
        title: "Sample Title 2",
        longitude: 7.6930,
        latitude: 45.0682,
        category: "WATER_SUPPLY",
        username: "SampleUser"
    }];

    const mockSingleReport = {
        id: "1",
        title: "Sample Title",
        description: "Sample Description",
        longitude: 7.6930,
        latitude: 45.0682,
        createdAt: new Date().toISOString(),
        category: "ARCHITECTURAL_BARRIERS",
        status: "APPROVED",
        username: "SampleUser",
        photos: ["",""]
    };
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

  describe('reportMapService unit tests', () => {
    it("should retrieve all approved reports to the user", async () => {


        (ReportRepository.getInstance as jest.Mock).mockReturnValue(mockReportMapRepository);
        mockReportMapRepository.getApprovedReports.mockResolvedValue({
                                                                        success: true, 
                                                                        data: mockReportArray
                                                                    });

        const instance = ReportMapService.getInstance();

        const response = await instance.getReportsForMap();

        expect(response.success).toBe(true);
        expect(mockReportMapRepository.getApprovedReports).toHaveBeenCalled();
        expect(ReportRepository.getInstance).toHaveBeenCalled();
        if(response.success){
            expect(response.data).toBe(mockReportArray);
        } 
    });
    it("should retrieve no approved reports to the user", async () => {
        (ReportRepository.getInstance as jest.Mock).mockReturnValue(mockReportMapRepository);
        mockReportMapRepository.getApprovedReports.mockResolvedValue(null);
        const instance = ReportMapService.getInstance();
        const response = await instance.getReportsForMap();
        expect(response).toBeNull();
        expect(mockReportMapRepository.getApprovedReports).toHaveBeenCalled();
    });
    it("should retrieve one approved report - without photos - to the user", async () => {

        (ReportRepository.getInstance as jest.Mock).mockReturnValue(mockReportMapRepository);
        mockReportMapRepository.getReportById.mockResolvedValue({
                                                                   success: true,
                                                                   data: mockSingleReport
                                                                });

        const instance = ReportMapService.getInstance();

        const response = await instance.getReportById("1");

        expect(response.success).toBe(true);
        expect(mockReportMapRepository.getReportById).toHaveBeenCalled();
        if(response.success){
            expect(response.data).toBe(mockSingleReport);
        } 
    });
    it("should propagate error if report not found", async () => {

        (ReportRepository.getInstance as jest.Mock).mockReturnValue(mockReportMapRepository);
        mockReportMapRepository.getReportById.mockResolvedValue({
                                                                   success: false,
                                                                   error: "Report not found"
                                                                });

        const instance = ReportMapService.getInstance();

        const response = await instance.getReportById("1");

        expect(mockReportMapRepository.getReportById).toHaveBeenCalled();
        expect(response.success).toBe(false);
        expect(response.error).toBe("Report not found");
    });
  });
});
