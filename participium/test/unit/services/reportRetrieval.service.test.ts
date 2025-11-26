import { ReportRepository } from "../../../src/app/lib/repositories/report.repository";
import { ReportRetrievalService } from "../../../src/app/lib/services/reportRetrieval.service";

const mockRepository = {
  getReportsByOfficerId: jest.fn(),
};

jest.mock('@/app/lib/repositories/report.repository', () => {
  return {
    ReportRepository: {
      getInstance: jest.fn(),
    },
  };
});

describe('Report service Story 4', () => {
    let reportService: ReportRetrievalService;

    beforeEach(() => {
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('retrieveReportsByOfficerId', () => {

        it("should call repository's retrieveReportsByOfficerId method and return the approved reports", async () => {
            (ReportRepository.getInstance as jest.Mock).mockReturnValue(mockRepository);
            mockRepository.getReportsByOfficerId.mockResolvedValue([{ id: 1, title: "Report 1", description: "Desc 1", photos: [], category: "WATER_SUPPLY", longitude: 0, latitude: 0, citizenId: 1, officerId: 2, citizen: { username: "citizen1" }, createdAt: new Date(), status: "PENDING" }, { id: 2, title: "Report 2", description: "Desc 2", photos: [], category: "ELECTRICITY", longitude: 1, latitude: 1, citizenId: 3, officerId: 2, citizen: { username: "citizen2" }, createdAt: new Date(), status: "IN_PROGRESS" }]);
            
            reportService = ReportRetrievalService.getInstance();
            const response = await reportService.retrieveReportsByOfficerId("1");
    
            expect(response.success).toBe(true);
            expect(mockRepository.getReportsByOfficerId).toHaveBeenCalled();
            expect(ReportRepository.getInstance).toHaveBeenCalled();
            if(response.success){
                expect(response.data.length).toBe(2);
            }
        });

    });

});