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
        createdAt: new Date(),
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
        mockReportMapService.getReportsForMap.mockResolvedValue({
            success: true,
            data: mockReportArray.map(r => ({
                id: r.id,
                title: r.title,
                longitude: r.longitude,
                latitude: r.latitude,
                category: r.category,
                citizen: { username: r.username }
            }))
        });

        const response = await getApprovedReportsForMap();
        expect(response.success).toBe(true);
        expect(mockReportMapService.getReportsForMap).toHaveBeenCalled();
        expect(ReportMapService.getInstance).toHaveBeenCalled();
        if(response.success){
            expect(response.data).toEqual(mockReportArray.map(r => ({
                id: r.id.toString(),
                title: r.title,
                longitude: r.longitude,
                latitude: r.latitude,
                category: r.category,
                username: r.username
            })));
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
        mockReportMapService.getReportById.mockResolvedValue({
            success: true,
            data: {
                ...mockSingleReport,
                citizen: { username: mockSingleReport.username }
            }
        });

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
                                        createdAt: mockSingleReport.createdAt.toISOString(),
                                        category: "ARCHITECTURAL_BARRIERS",
                                        status: "APPROVED",
                                        photos: [],
                                        username: "SampleUser"
                                    });
        } 
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
  });
});
