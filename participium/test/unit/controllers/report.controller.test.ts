import {
  createReport,
  approveReport,
  rejectReport,
  getReportsByAssigneeId,
} from "../../../src/app/lib/controllers/report.controller";
import {
  ReportRegistrationResponse,
  ReportRequest,
} from "../../../src/app/lib/dtos/report.dto";
import { ReportCreationService } from "../../../src/app/lib/services/reportCreation.service";
import { ReportAssignmentService } from "../../../src/app/lib/services/reportAssignment.service";

const mockService = {
  createReport: jest.fn(),
};

const mockRetrievalService = {
  retrieveReportsByOfficerId: jest.fn(),
};

const mockAssignmentService = {
  assignReportToOfficer: jest.fn(),
  rejectReport: jest.fn(),
};

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("next-auth", () => ({
  default: jest.fn(() => ({
    GET: jest.fn(),
    POST: jest.fn(),
  })),
}));

jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

import { getServerSession } from "next-auth/next";
import { ReportRetrievalService } from "../../../src/app/lib/services/reportRetrieval.service";

jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    handlers: { GET: jest.fn(), POST: jest.fn() }
  })),
}));


jest.mock("@/app/lib/services/reportCreation.service", () => {
  return {
    ReportCreationService: {
      getInstance: jest.fn(),
    },
  };
});

jest.mock("@/app/lib/services/reportRetrieval.service", () => {
  return {
    ReportRetrievalService: {
      getInstance: jest.fn(),
    },
  };
});

jest.mock("@/app/lib/services/reportAssignment.service", () => {
  return {
    ReportAssignmentService: {
      getInstance: jest.fn(),
    },
  };
});

describe("ReportController Story 4", () => {
  const citizenSession = {
    user: {
      id: "2",
      name: "Citizen User",
      role: "CITIZEN",
    },
    expires: "2024-12-31T23:59:59.999Z",
  };
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
      id: "2",
      name: "Officer User",
      role: "PUBLIC_RELATIONS_OFFICER",
    },
    expires: "2024-12-31T23:59:59.999Z",
  };

  const adminSession = {
    user: {
      id: "3",
      name: "Admin User",
      role: "ADMIN",
    },
    expires: "2024-12-31T23:59:59.999Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createReport", () => {
    it("should call service's createReport method and return success true", async () => {
        (ReportCreationService.getInstance as jest.Mock).mockReturnValue(mockService);
        mockService.createReport.mockResolvedValue({ success: true, data: "Report with id: 1 succesfuly created" });
        (getServerSession as jest.Mock).mockResolvedValue(citizenSession);
        const response = await createReport(
                                        "mockReport",
                                        "mockDescription",
                                        ["photo1"],
                                        "WATER_SUPPLY",
                                        0,
                                        0,
                                        false
                                      );
        if(!response.success){
            expect(response.error).toBe("");
        }
        expect(response.success).toBe(true);
        expect(mockService.createReport).toHaveBeenCalled();
        expect(ReportCreationService.getInstance).toHaveBeenCalled();
        if(response.success){
            expect(response.data).toBe("Report with id: 1 succesfuly created");
        } 
    });

    it("should call service's createReport method and return success false", async () => {
      (ReportCreationService.getInstance as jest.Mock).mockReturnValue(
        mockService
      );
      mockService.createReport.mockResolvedValue({
        success: false,
        error: "fail to create the report",
      });

      const response = await createReport(
        "mockReport",
        "mockDescription",
        ["photo1"],
        "WATER_SUPPLY",
        0,
        0,
        false
      );

      expect(response.success).toBe(false);
      expect(mockService.createReport).toHaveBeenCalled();
      expect(ReportCreationService.getInstance).toHaveBeenCalled();
      if (!response.success) {
        expect(response.error).toBe("fail to create the report");
      }
        expect(response.success).toBe(false);
        if(!response.success){
            expect(response.error).toBe("fail to create the report");
        }
    });

    it("should register a new report successfully", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(citizenSession);
      (ReportCreationService.getInstance as jest.Mock).mockReturnValue(
        mockService
      );
      mockService.createReport.mockResolvedValue({
        success: true,
        data: "Report with id: 1 succesfuly created",
      });
      const response: ReportRegistrationResponse = await createReport(
        "mockReview",
        "mockDescriptionLongEnough",
        ["photo1"],
        "WATER_SUPPLY",
        10,
        10,
        true
      );
      console.log("Response from register action:", response);
      if(!response.success){
          expect(response.error).toBe("");
      }
      expect(response.success).toBe(true);
      expect(mockService.createReport).toHaveBeenCalled();
      if (response.success) {
        expect(response.data).toBe("Report with id: 1 succesfuly created");
      }
    });

    it("should not register a new report with invalid fields", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(citizenSession);
      (ReportCreationService.getInstance as jest.Mock).mockReturnValue(
        mockService
      );
      mockService.createReport.mockResolvedValue({
        success: true,
        data: "Report with id: 1 succesfuly created",
      });
      const response: ReportRegistrationResponse = await createReport(
        "",
        "mockDescriptionLongEnough",
        ["photo1"],
        "WATER_SUPPLY",
        10,
        10,
        true
      );
      console.log("Response from register action:", response);
      expect(response.success).toBe(false);
      expect(mockService.createReport).not.toHaveBeenCalled();
      if (!response.success) {
        expect(response.error).toBe("Invalid inputs");
      }
    });

    it("should not register a new report without a session", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      (ReportCreationService.getInstance as jest.Mock).mockReturnValue(
        mockService
      );
      mockService.createReport.mockResolvedValue({
        success: true,
        data: "Report with id: 1 succesfuly created",
      });
      const response: ReportRegistrationResponse = await createReport(
        "mockReview",
        "mockDescriptionLongEnough",
        ["photo1"],
        "WATER_SUPPLY",
        10,
        10,
        true
      );
      console.log("Response from register action:", response);
      expect(response.success).toBe(false);
      expect(mockService.createReport).not.toHaveBeenCalled();
      if (!response.success) {
        expect(response.error).toBe("Unauthorized report");
      }
    });

    it("should not register a new report from an officer", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(officerSession);
      (ReportCreationService.getInstance as jest.Mock).mockReturnValue(
        mockService
      );
      mockService.createReport.mockResolvedValue({
        success: true,
        data: "Report with id: 1 succesfuly created",
      });
      const response: ReportRegistrationResponse = await createReport(
        "mockReview",
        "mockDescriptionLongEnough",
        ["photo1"],
        "WATER_SUPPLY",
        10,
        10,
        true
      );
      console.log("Response from register action:", response);
      expect(response.success).toBe(false);
      expect(mockService.createReport).not.toHaveBeenCalled();
      if (!response.success) {
        expect(response.error).toBe("Unauthorized report");
      }
    });

    it("should not register a new report if the controller fails", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(citizenSession);
      (ReportCreationService.getInstance as jest.Mock).mockReturnValue(
        mockService
      );
      mockService.createReport.mockResolvedValue({
        success: false,
        error: "Failed to add the report to the database",
      });
      const response: ReportRegistrationResponse = await createReport(
        "mockReview",
        "mockDescriptionLongEnough",
        ["photo1"],
        "WATER_SUPPLY",
        10,
        10,
        true
      );
      console.log("Response from register action:", response);
      expect(mockService.createReport).toHaveBeenCalled();
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Failed to add the report to the database");
      }
    });
  });

  describe("approveReport - Story 6", () => {
    beforeEach(() => {
      (ReportAssignmentService.getInstance as jest.Mock).mockReturnValue(
        mockAssignmentService
      );
    });

    it("should approve report successfully when user is OFFICER", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(officerSession);
      mockAssignmentService.assignReportToOfficer.mockResolvedValue({
        success: true,
        data: "Report assigned to officer ID: 5",
      });

      const response = await approveReport(
        1,
        "DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES"
      );

      expect(response.success).toBe(true);
      expect(mockAssignmentService.assignReportToOfficer).toHaveBeenCalledWith(
        1,
        "DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES"
      );
      if (response.success) {
        expect(response.data).toBe("Report assigned to officer ID: 5");
      }
    });

    it("should approve report successfully when user is ADMIN", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);
      mockAssignmentService.assignReportToOfficer.mockResolvedValue({
        success: true,
        data: "Report assigned to officer ID: 5",
      });

      const response = await approveReport(1, "DEPARTMENT_OF_COMMERCE");

      expect(response.success).toBe(true);
      expect(mockAssignmentService.assignReportToOfficer).toHaveBeenCalled();
    });

    it("should return error when user is not authorized (CITIZEN)", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(citizenSession);

      const response = await approveReport(
        1,
        "DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES"
      );

      expect(response.success).toBe(false);
      expect(
        mockAssignmentService.assignReportToOfficer
      ).not.toHaveBeenCalled();
      if (!response.success) {
        expect(response.error).toBe("Unauthorized access");
      }
    });

    it("should return error when no session exists", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await approveReport(
        1,
        "DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES"
      );

      expect(response.success).toBe(false);
      expect(
        mockAssignmentService.assignReportToOfficer
      ).not.toHaveBeenCalled();
      if (!response.success) {
        expect(response.error).toBe("Unauthorized access");
      }
    });

    it("should return error when service fails", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(officerSession);
      mockAssignmentService.assignReportToOfficer.mockResolvedValue({
        success: false,
        error: "No officers available in the specified department",
      });

      const response = await approveReport(1, "DEPARTMENT_OF_COMMERCE");

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe(
          "No officers available in the specified department"
        );
      }
    });
  });

  describe("rejectReport - Story 6", () => {
    beforeEach(() => {
      (ReportAssignmentService.getInstance as jest.Mock).mockReturnValue(
        mockAssignmentService
      );
    });

    it("should reject report successfully when user is OFFICER", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(officerSession);
      mockAssignmentService.rejectReport.mockResolvedValue({
        success: true,
        data: "Report rejected with reason: Insufficient information",
      });

      const response = await rejectReport(1, "Insufficient information");

      expect(response.success).toBe(true);
      expect(mockAssignmentService.rejectReport).toHaveBeenCalledWith(
        1,
        "Insufficient information"
      );
      if (response.success) {
        expect(response.data).toContain("Report rejected with reason");
      }
    });

    it("should reject report successfully when user is ADMIN", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);
      mockAssignmentService.rejectReport.mockResolvedValue({
        success: true,
        data: "Report rejected with reason: Duplicate report",
      });

      const response = await rejectReport(1, "Duplicate report");

      expect(response.success).toBe(true);
      expect(mockAssignmentService.rejectReport).toHaveBeenCalled();
    });

    it("should return error when user is not authorized (CITIZEN)", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(citizenSession);

      const response = await rejectReport(1, "Test reason");

      expect(response.success).toBe(false);
      expect(mockAssignmentService.rejectReport).not.toHaveBeenCalled();
      if (!response.success) {
        expect(response.error).toBe("Unauthorized access");
      }
    });

    it("should return error when no session exists", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await rejectReport(1, "Test reason");

      expect(response.success).toBe(false);
      expect(mockAssignmentService.rejectReport).not.toHaveBeenCalled();
      if (!response.success) {
        expect(response.error).toBe("Unauthorized access");
      }
    });

    it("should return error when service fails", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(officerSession);
      mockAssignmentService.rejectReport.mockResolvedValue({
        success: false,
        error: "Failed to reject report",
      });

      const response = await rejectReport(1, "Test reason");

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Failed to reject report");
      }
    });
        });
    
        it("should not register a new report with invalid fields", async () => {
            (getServerSession as jest.Mock).mockResolvedValue(citizenSession);
            (ReportCreationService.getInstance as jest.Mock).mockReturnValue(mockService);
            mockService.createReport.mockResolvedValue({ success: true, data: "Report with id: 1 succesfuly created" });
            const response: ReportRegistrationResponse =  await createReport("",
                                                                            "mockDescriptionLongEnough",
                                                                            ["photo1"],
                                                                            "WATER_SUPPLY",
                                                                            10,
                                                                            10,
                                                                            true);
            console.log("Response from register action:", response);
            expect(response.success).toBe(false);
            expect(mockService.createReport).not.toHaveBeenCalled();
            if(!response.success){
                expect(response.error).toBe("Invalid inputs");
            }
        });
    
    
        it("should not register a new report without a session", async () => {
            (getServerSession as jest.Mock).mockResolvedValue(null);
            (ReportCreationService.getInstance as jest.Mock).mockReturnValue(mockService);
            mockService.createReport.mockResolvedValue({ success: true, data: "Report with id: 1 succesfuly created" });
            const response: ReportRegistrationResponse =  await createReport("mockReview",
                                                                            "mockDescriptionLongEnough",
                                                                            ["photo1"],
                                                                            "WATER_SUPPLY",
                                                                            10,
                                                                            10,
                                                                            true);
            console.log("Response from register action:", response);
            expect(response.success).toBe(false);
            expect(mockService.createReport).not.toHaveBeenCalled();
            if(!response.success){
                expect(response.error).toBe("Unauthorized report");
            }
        });
    
    
        it("should not register a new report from an officer", async () => {
            (getServerSession as jest.Mock).mockResolvedValue(officerSession);
            (ReportCreationService.getInstance as jest.Mock).mockReturnValue(mockService);
            mockService.createReport.mockResolvedValue({ success: true, data: "Report with id: 1 succesfuly created" });
            const response: ReportRegistrationResponse =  await createReport("mockReview",
                                                                            "mockDescriptionLongEnough",
                                                                            ["photo1"],
                                                                            "WATER_SUPPLY",
                                                                            10,
                                                                            10,
                                                                            true);
            console.log("Response from register action:", response);
            expect(response.success).toBe(false);
            expect(mockService.createReport).not.toHaveBeenCalled();
            if(!response.success){
                expect(response.error).toBe("Unauthorized report");
            }
        });
    
    
        it("should not register a new report if the controller fails", async () => {
            (getServerSession as jest.Mock).mockResolvedValue(citizenSession);
            (ReportCreationService.getInstance as jest.Mock).mockReturnValue(mockService);
            mockService.createReport.mockResolvedValue({ success: false, error: "Failed to add the report to the database" });
            const response: ReportRegistrationResponse =  await createReport("mockReview",
                                                                            "mockDescriptionLongEnough",
                                                                            ["photo1"],
                                                                            "WATER_SUPPLY",
                                                                            10,
                                                                            10,
                                                                            true);
            console.log("Response from register action:", response);
            expect(response.success).toBe(false);
            if(!response.success){
                expect(response.error).toBe("Failed to add the report to the database");
            }
        });



  });


  describe("retrieve reports to officer - Story 8", () => {

    const officerSession = {
      user: {
        id: "2",
        name: "Officer User",
        role: "TECHNICAL_OFFICER",
      },
      expires: "2024-12-31T23:59:59.999Z",
    };

    beforeEach(() => {
      (ReportRetrievalService.getInstance as jest.Mock).mockReturnValue(
        mockRetrievalService
      );
    });

    it("should reject report successfully when user is OFFICER", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(officerSession);
      mockRetrievalService.retrieveReportsByOfficerId.mockResolvedValue({
        success: true,
        data: [{
          id: "1",
          title: "Pothole on Main St",
          description: "Large pothole causing traffic issues",
          category: "ROAD_MAINTENANCE",
          createdAt: new Date().toISOString(),
          photos: ["photo1.jpg", "photo2.jpg"],
          longitude: -122.4194,
          latitude: 37.7749,
          isAnonymous: false,
          userId: "2",
          assignedOfficerId: "5",
          status: "PENDING",
          resolutionComments: null,
          resolvedAt: null,
          user: {
            id: "2",
            firstName: "John",
            lastName: "Doe",
            username: "johndoe",
            email: "johndoe@example.com"
          }
        }, 
        {
          id: "2",
          title: "Pothole on Main St",
          description: "Large pothole causing traffic issues",
          category: "ROAD_MAINTENANCE",
          createdAt: new Date().toISOString(),
          photos: ["photo1.jpg", "photo2.jpg"],
          longitude: -122.4194,
          latitude: 37.7749,
          isAnonymous: false,
          userId: "2",
          assignedOfficerId: "5",
          status: "PENDING",
          resolutionComments: null,
          resolvedAt: null,
          user: {
            id: "2",
            firstName: "John",
            lastName: "Doe",
            username: "johndoe",
            email: "johndoe@example.com"
          }
        }],
      });

      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: "5",
          role: "TECHNICAL_OFFICER",
        },
      });

      const response = await getReportsByAssigneeId();

      expect(response.success).toBe(true);
      expect(mockRetrievalService.retrieveReportsByOfficerId).toHaveBeenCalledWith("5");
      if (response.success) {
        expect(response.data.length).toBe(2);
      }
    });

    it("should return error when user is not authorized (CITIZEN)", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(citizenSession);

      const response = await getReportsByAssigneeId();

      expect(response.success).toBe(false);
      expect(mockRetrievalService.retrieveReportsByOfficerId).not.toHaveBeenCalled();
      if (!response.success) {
        expect(response.error).toBe("Unauthorized access");
      }
    });

    it("should return error when no session exists", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await getReportsByAssigneeId();

      expect(response.success).toBe(false);
      expect(mockRetrievalService.retrieveReportsByOfficerId).not.toHaveBeenCalled();
      if (!response.success) {
        expect(response.error).toBe("Unauthorized access");
      }
    });

  });

});
