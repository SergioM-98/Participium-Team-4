import { ReportController } from "@/app/lib/controllers/report.controller";
import { ReportRegistrationResponse } from "@/app/lib/dtos/report.dto";
import { prisma } from "@/prisma/db";

jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(),
}));

jest.mock('@/auth', () => ({
    authOptions: {}
}));

import { getServerSession } from 'next-auth/next';

const mockReportController = {
    createReport: jest.fn(),
};

jest.mock('@/controllers/report.controller', () => {
    return {
        ReportController: jest.fn().mockImplementation(() => mockReportController)
    }
});

describe('User Actions - register function Story 1', () => {




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

    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should register a new report successfully", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(citizenSession);
        mockReportController.createReport.mockResolvedValue({ success: true, data: "Report with id: 1 succesfuly created" });
        const response: ReportRegistrationResponse =  await new ReportController().createReport("mockReview",
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
        const response: ReportRegistrationResponse =  await new ReportController().createReport("",
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
        const response: ReportRegistrationResponse =  await new ReportController().createReport("mockReview",
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
        const response: ReportRegistrationResponse =  await new ReportController().createReport("mockReview",
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
        const response: ReportRegistrationResponse =  await new ReportController().createReport("mockReview",
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