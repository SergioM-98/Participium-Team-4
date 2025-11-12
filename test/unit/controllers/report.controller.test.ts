import { ReportController } from "@/app/lib/controllers/report.controller";
import { ReportRequest } from "@/app/lib/dtos/report.dto";
import { ReportCreationService } from "@/app/lib/services/reportCreation.service";

const mockService = {
  createReport: jest.fn(),
};

jest.mock('@/app/lib/services/reportCreation.service', () => {
  return {
    ReportCreationService: {
      getInstance: jest.fn(),
    },
  };
});

describe('ReportController Story 4', () => {
    let reportController: ReportController;
    let mockData: ReportRequest;

    beforeEach(() => {
        reportController = new ReportController();
        mockData = {
            title: "mockReport",
            description: "mockDescription",
            photos: ["photo1"],
            category: "WATER_SUPPLY",
            longitude: 0,
            latitude: 0,
            userId: "1",
            isAnonymous: false
        };

        jest.clearAllMocks();
    });

  describe('createReport', () => {
    it("should call service's createReport method and return success true", async () => {
        (ReportCreationService.getInstance as jest.Mock).mockReturnValue(mockService);
        mockService.createReport.mockResolvedValue({ success: true, data: "Report with id: 1 succesfuly created" });

        const response = await reportController.createReport(mockData);

        expect(response.success).toBe(true);
        expect(mockService.createReport).toHaveBeenCalled();
        expect(ReportCreationService.getInstance).toHaveBeenCalled();
        if(response.success){
            expect(response.data).toBe("Report with id: 1 succesfuly created");
        } 
    });

    it("should call service's createReport method and return success false", async () => {
        (ReportCreationService.getInstance as jest.Mock).mockReturnValue(mockService);
        mockService.createReport.mockResolvedValue({ success: false, error: "fail to create the report" });

        const response = await reportController.createReport(mockData);

        expect(response.success).toBe(false);
        expect(mockService.createReport).toHaveBeenCalled();
        expect(ReportCreationService.getInstance).toHaveBeenCalled();
        if(!response.success){
            expect(response.error).toBe("fail to create the report");
        }
    });
  });
});
