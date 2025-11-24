import { getApprovedReportsForMap, getReportById } from "@/app/lib/controllers/reportMap.controller";
import { ReportMapService } from "@/app/lib/services/reportMap.service";

const mockReportMapService = {
    getReportsForMap: jest.fn(),
    getReportById: jest.fn(),

};

jest.mock('@/app/lib/services/reportMap.service', () => {
  return {
    ReportMapService: {
      getInstance: jest.fn(),
    },
  };
});

describe('ReportMapController Story 7', () => {

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

  describe('reportMapController unit tests', () => {
    it("should retrieve all approved reports to the user", async () => {


        (ReportMapService.getInstance as jest.Mock).mockReturnValue(mockReportMapService);
        mockReportMapService.getReportsForMap.mockResolvedValue(mockReportArray);

        const response = await getApprovedReportsForMap();

        expect(response.success).toBe(true);
        expect(mockReportMapService.getReportsForMap).toHaveBeenCalled();
        expect(ReportMapService.getInstance).toHaveBeenCalled();
        if(response.success){
            expect(response.data).toBe(mockReportArray);
        } 
    });
    it("should retrieve no approved reports to the user", async () => {


        (ReportMapService.getInstance as jest.Mock).mockReturnValue(mockReportMapService);
        mockReportMapService.getReportsForMap.mockResolvedValue(null);

        const response = await getApprovedReportsForMap();

        expect(response.success).toBe(false);
        expect(mockReportMapService.getReportsForMap).toHaveBeenCalled();
        expect(ReportMapService.getInstance).toHaveBeenCalled();
        if(!response.success){
            expect(response.error).toBe("No reports found");
        } 
    });
    it("should retrieve one approved report - without photos - to the user", async () => {


        (ReportMapService.getInstance as jest.Mock).mockReturnValue(mockReportMapService);
        mockReportMapService.getReportById.mockResolvedValue(mockSingleReport);

        const response = await getReportById({id: "1"});

        expect(response.success).toBe(true);
        expect(mockReportMapService.getReportById).toHaveBeenCalled();
        expect(ReportMapService.getInstance).toHaveBeenCalled();
        if(response.success){
            expect(response.data).toEqual({
                                        id: "1",
                                        title: "Sample Title",
                                        description: "Sample Description",
                                        longitude: 7.6930,
                                        latitude: 45.0682,
                                        createdAt: new Date().toISOString(),
                                        category: "ARCHITECTURAL_BARRIERS",
                                        status: "APPROVED",
                                        username: "SampleUser",
                                        photos: []
                                    });
        } 
    });
    it("should return error for invalid report id", async () => {
        const response = await getReportById({ id: "" });
        expect(response.success).toBe(false);
        expect(response.error).toBe("Invalid report id");
    });
    it("should return error if report not found", async () => {
        (ReportMapService.getInstance as jest.Mock).mockReturnValue(mockReportMapService);
        mockReportMapService.getReportById.mockResolvedValue(null);
        const response = await getReportById({ id: "999" });
        expect(mockReportMapService.getReportById).toHaveBeenCalled();
        expect(ReportMapService.getInstance).toHaveBeenCalled();
        expect(response.success).toBe(false);
        expect(response.error).toBe("Report not found");
    });
    it("should filter out invalid reports", async () => {
        const mixedReports = [
            ...mockReportArray,
            null,
            { id: null, title: "" }
        ];
        (ReportMapService.getInstance as jest.Mock).mockReturnValue(mockReportMapService);
        mockReportMapService.getReportsForMap.mockResolvedValue(mixedReports);

        const response = await getApprovedReportsForMap();
        expect(response.success).toBe(true);
        if(response.success){
            expect(response.data).toBeDefined();
            if(response.data){
                expect(response.data.length).toBe(2);
            }
        }
    });
  });
});
