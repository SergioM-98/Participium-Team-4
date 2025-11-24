import { createReport } from "@/app/lib/controllers/report.controller";
import { ReportRegistrationResponse } from "@/app/lib/dtos/report.dto";
import { ReportCreationService } from "@/app/lib/services/reportCreation.service";
import { getServerSession } from 'next-auth/next';

const mockService = {
  createReport: jest.fn(),
};

jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(),
}));

jest.mock('@/auth', () => ({
    authOptions: {}
}));


const mockReportController = {
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

    const citizenSession = {
        user: {
            id: '2', 
            name: 'Citizen User',
            role: 'CITIZEN'
        },
        expires: '2024-12-31T23:59:59.999Z'
    };

    const officerSession = {
        user: {
            id: '2', 
            name: 'Officer User',
            role: 'OFFICER'
        },
        expires: '2024-12-31T23:59:59.999Z'
    };
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

  describe('createReport', () => {
    it("should call service's createReport method and return success true", async () => {
        (ReportCreationService.getInstance as jest.Mock).mockReturnValue(mockService);
        mockService.createReport.mockResolvedValue({ success: true, data: "Report with id: 1 succesfuly created" });

        const response = await createReport(
                                        "mockReport",
                                        "mockDescription",
                                        ["photo1"],
                                        "WATER_SUPPLY",
                                        0,
                                        0,
                                        false
                                      );

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

        const response = await createReport(
                                        "mockReport",
                                        "mockDescription",
                                        ["photo1"],
                                        "WATER_SUPPLY",
                                        0,
                                        0,
                                        false);

        expect(response.success).toBe(false);
        expect(mockService.createReport).toHaveBeenCalled();
        expect(ReportCreationService.getInstance).toHaveBeenCalled();
        if(!response.success){
            expect(response.error).toBe("fail to create the report");
        }
    });

    it("should register a new report successfully", async () => {
            (getServerSession as jest.Mock).mockResolvedValue(citizenSession);
            mockReportController.createReport.mockResolvedValue({ success: true, data: "Report with id: 1 succesfuly created" });
            const response: ReportRegistrationResponse =  await createReport("mockReview",
                                                                            "mockDescriptionLongEnough",
                                                                            ["photo1"],
                                                                            "WATER_SUPPLY",
                                                                            10,
                                                                            10,
                                                                            true);
            console.log("Response from register action:", response);
            expect(response.success).toBe(true);
            expect(mockReportController.createReport).toHaveBeenCalled();
            if(response.success){
                expect(response.data).toBe("Report with id: 1 succesfuly created");
            }
        });
    
        it("should not register a new report with invalid fields", async () => {
            (getServerSession as jest.Mock).mockResolvedValue(citizenSession);
            mockReportController.createReport.mockResolvedValue({ success: true, data: "Report with id: 1 succesfuly created" });
            const response: ReportRegistrationResponse =  await createReport("",
                                                                            "mockDescriptionLongEnough",
                                                                            ["photo1"],
                                                                            "WATER_SUPPLY",
                                                                            10,
                                                                            10,
                                                                            true);
            console.log("Response from register action:", response);
            expect(response.success).toBe(false);
            expect(mockReportController.createReport).not.toHaveBeenCalled();
            if(!response.success){
                expect(response.error).toBe("Invalid inputs");
            }
        });
    
    
        it("should not register a new report without a session", async () => {
            (getServerSession as jest.Mock).mockResolvedValue(null);
            mockReportController.createReport.mockResolvedValue({ success: true, data: "Report with id: 1 succesfuly created" });
            const response: ReportRegistrationResponse =  await createReport("mockReview",
                                                                            "mockDescriptionLongEnough",
                                                                            ["photo1"],
                                                                            "WATER_SUPPLY",
                                                                            10,
                                                                            10,
                                                                            true);
            console.log("Response from register action:", response);
            expect(response.success).toBe(false);
            expect(mockReportController.createReport).not.toHaveBeenCalled();
            if(!response.success){
                expect(response.error).toBe("Unauthorized report");
            }
        });
    
    
        it("should not register a new report from an officer", async () => {
            (getServerSession as jest.Mock).mockResolvedValue(officerSession);
            mockReportController.createReport.mockResolvedValue({ success: true, data: "Report with id: 1 succesfuly created" });
            const response: ReportRegistrationResponse =  await createReport("mockReview",
                                                                            "mockDescriptionLongEnough",
                                                                            ["photo1"],
                                                                            "WATER_SUPPLY",
                                                                            10,
                                                                            10,
                                                                            true);
            console.log("Response from register action:", response);
            expect(response.success).toBe(false);
            expect(mockReportController.createReport).not.toHaveBeenCalled();
            if(!response.success){
                expect(response.error).toBe("Unauthorized report");
            }
        });
    
    
        it("should not register a new report if the controller fails", async () => {
            (getServerSession as jest.Mock).mockResolvedValue(citizenSession);
            mockReportController.createReport.mockResolvedValue({ success: false, error: "Failed to add the report to the database" });
            const response: ReportRegistrationResponse =  await createReport("mockReview",
                                                                            "mockDescriptionLongEnough",
                                                                            ["photo1"],
                                                                            "WATER_SUPPLY",
                                                                            10,
                                                                            10,
                                                                            true);
            console.log("Response from register action:", response);
            expect(response.success).toBe(false);
            expect(mockReportController.createReport).toHaveBeenCalled();
            if(!response.success){
                expect(response.error).toBe("Failed to add the report to the database");
            }
        });



  });
});
