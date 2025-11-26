import { ReportRequest } from "../../../src/app/lib/dtos/report.dto";
import { ReportRepository } from "../../../src/app/lib/repositories/report.repository";
import { ReportCreationService } from "../../../src/app/lib/services/reportCreation.service";

const mockRepository = {
  createReport: jest.fn(),
};

jest.mock('@/app/lib/repositories/report.repository', () => {
  return {
    ReportRepository: {
      getInstance: jest.fn(),
    },
  };
});

describe('Report service Story 4', () => {
    let reportService: ReportCreationService;
    let mockData: ReportRequest;

    beforeEach(() => {
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
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createReport', () => {

        it("should call repository's createReport method and return success true", async () => {
            (ReportRepository.getInstance as jest.Mock).mockReturnValue(mockRepository);
            mockRepository.createReport.mockResolvedValue({ success: true, data: "Report with id: 1 succesfuly created" });
            
            reportService = ReportCreationService.getInstance();
            const response = await reportService.createReport(mockData);
    
            expect(response.success).toBe(true);
            expect(mockRepository.createReport).toHaveBeenCalled();
            expect(ReportRepository.getInstance).toHaveBeenCalled();
            if(response.success){
                expect(response.data).toBe("Report with id: 1 succesfuly created");
            } 
        });


        it("should call repository's createReport method and return success false", async () => {
            (ReportRepository.getInstance as jest.Mock).mockReturnValue(mockRepository);
            mockRepository.createReport.mockResolvedValue({ success: false, error: "fail to create the report" });
            
            reportService = ReportCreationService.getInstance();
            const response = await reportService.createReport(mockData);
    
            expect(response.success).toBe(false);
            expect(mockRepository.createReport).toHaveBeenCalled();
            if(!response.success){
                expect(response.error).toBe("fail to create the report");
            } 
        });



    });

});