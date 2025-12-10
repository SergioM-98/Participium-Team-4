import {
  createReport,
  approveReport,
  rejectReport,
  getReportsByOfficerId,
  assignReportToCompany,
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

onst mockRetrievalService = {
  retrieveReportsByOfficerId: jest.fn(),
  retrievePendingApprovalReports: jest.fn(),
  retrieveReportsByMaintainerId: jest.fn(),
};

const mockAssignmentService = {
  assignReportToOfficer: jest.fn(),
  rejectReport: jest.fn(),
  assignReportToCompany: jest.fn(),
};

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

// Mock di next-auth per evitare che NextAuth() venga eseguito
jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    handlers: { GET: jest.fn(), POST: jest.fn() },
  })),
}));

jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
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

jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    handlers: { GET: jest.fn(), POST: jest.fn() },
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
      role: ["CITIZEN"],
    },
    expires: "2024-12-31T23:59:59.999Z",
  };
  describe("ReportController Story 4", () => {
    const citizenSession = {
      user: {
        id: "2",
        name: "Citizen User",
        role: "CITIZEN",
      },
      expires: "2024-12-31T23:59:59.999Z",
    };

    const officerSession = {
      user: {
        id: "2",
        name: "Officer User",
        role: ["PUBLIC_RELATIONS_OFFICER"],
      },
      expires: "2024-12-31T23:59:59.999Z",
    };

    const adminSession = {
      user: {
        id: "3",
        name: "Admin User",
        role: ["ADMIN"],
      },
      expires: "2024-12-31T23:59:59.999Z",
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe("createReport", () => {
      it("should call service's createReport method and return success true", async () => {
        (ReportCreationService.getInstance as jest.Mock).mockReturnValue(
          mockService,
        );
        mockService.createReport.mockResolvedValue({
          success: true,
          data: "Report with id: 1 succesfuly created",
        });
        (getServerSession as jest.Mock).mockResolvedValue(citizenSession);
        const response = await createReport(
          "mockReport",
          "mockDescription",
          ["photo1"],
          "WATER_SUPPLY",
          0,
          0,
          false,
        );
        if (!response.success) {
          expect(response.error).toBe("");
        }
        expect(response.success).toBe(true);
        expect(mockService.createReport).toHaveBeenCalled();
        expect(ReportCreationService.getInstance).toHaveBeenCalled();
        if (response.success) {
          expect(response.data).toBe("Report with id: 1 succesfuly created");
        }
      });

      it("should call service's createReport method and return success false", async () => {
        (ReportCreationService.getInstance as jest.Mock).mockReturnValue(
          mockService,
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
          false,
        );

        expect(response.success).toBe(false);
        expect(mockService.createReport).toHaveBeenCalled();
        expect(ReportCreationService.getInstance).toHaveBeenCalled();
        if (!response.success) {
          expect(response.error).toBe("fail to create the report");
        }
        expect(response.success).toBe(false);
        if (!response.success) {
          expect(response.error).toBe("fail to create the report");
        }
      });

      it("should register a new report successfully", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(citizenSession);
        (ReportCreationService.getInstance as jest.Mock).mockReturnValue(
          mockService,
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
          true,
        );
        console.log("Response from register action:", response);
        if (!response.success) {
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
          mockService,
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
          true,
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
          mockService,
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
          true,
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
          mockService,
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
          true,
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
          mockService,
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
          true,
        );
        console.log("Response from register action:", response);
        expect(mockService.createReport).toHaveBeenCalled();
        expect(response.success).toBe(false);
        if (!response.success) {
          expect(response.error).toBe(
            "Failed to add the report to the database",
          );
        }
      });
    });

    describe("approveReport - Story 6", () => {
      beforeEach(() => {
        (ReportAssignmentService.getInstance as jest.Mock).mockReturnValue(
          mockAssignmentService,
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
          "DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES",
        );

        expect(response.success).toBe(true);
        expect(
          mockAssignmentService.assignReportToOfficer,
        ).toHaveBeenCalledWith(
          1,
          "DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES",
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
          "DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES",
        );

        expect(response.success).toBe(false);
        expect(
          mockAssignmentService.assignReportToOfficer,
        ).not.toHaveBeenCalled();
        if (!response.success) {
          expect(response.error).toBe("Unauthorized access");
        }
      });

      it("should return error when no session exists", async () => {
        (getServerSession as jest.Mock).mockResolvedValue(null);

        const response = await approveReport(
          1,
          "DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES",
        );

        expect(response.success).toBe(false);
        expect(
          mockAssignmentService.assignReportToOfficer,
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
            "No officers available in the specified department",
          );
        }
      });
    });

    describe("rejectReport - Story 6", () => {
      beforeEach(() => {
        (ReportAssignmentService.getInstance as jest.Mock).mockReturnValue(
          mockAssignmentService,
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
          "Insufficient information",
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
      (ReportCreationService.getInstance as jest.Mock).mockReturnValue(
        mockService,
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
        true,
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
        mockService,
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
        true,
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
        mockService,
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
        true,
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
        mockService,
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
        true,
      );
      console.log("Response from register action:", response);
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Failed to add the report to the database");
      }
    });
  });

  describe("retrieve reports to officer - Story 8", () => {
    const officerSession = {
      user: {
        id: "2",
        name: "Officer User",
        role: ["TECHNICAL_OFFICER"],
      },
      expires: "2024-12-31T23:59:59.999Z",
    };

    beforeEach(() => {
      (ReportRetrievalService.getInstance as jest.Mock).mockReturnValue(
        mockRetrievalService,
      );
    });

    it("should reject report successfully when user is OFFICER", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(officerSession);
      mockRetrievalService.retrieveReportsByOfficerId.mockResolvedValue({
        success: true,
        data: [
          {
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
              email: "johndoe@example.com",
            },
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
              email: "johndoe@example.com",
            },
          },
        ],
      });

      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: "5",
          role: ["TECHNICAL_OFFICER"],
        },
      });

      const response = await getReportsByOfficerId();

      expect(response.success).toBe(true);
      expect(
        mockRetrievalService.retrieveReportsByOfficerId,
      ).toHaveBeenCalledWith("5");
      if (response.success) {
        expect(response.data.length).toBe(2);
      }
    });

    it("should return error when user is not authorized (CITIZEN)", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(citizenSession);

      const response = await getReportsByOfficerId();

      expect(response.success).toBe(false);
      expect(
        mockRetrievalService.retrieveReportsByOfficerId,
      ).not.toHaveBeenCalled();
      if (!response.success) {
        expect(response.error).toBe("Unauthorized access");
      }
    });

    it("should return error when no session exists", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await getReportsByOfficerId();

      expect(response.success).toBe(false);
      expect(
        mockRetrievalService.retrieveReportsByOfficerId,
      ).not.toHaveBeenCalled();
      if (!response.success) {
        expect(response.error).toBe("Unauthorized access");
      }
    });
  });

  describe("assignReportToCompany - Story 24", () => {
    const officerSession = {
      user: {
        id: "1",
        name: "Officer User",
        role: ["TECHNICAL_OFFICER"],
      },
      expires: "2024-12-31T23:59:59.999Z",
    };

    const adminSession = {
      user: {
        id: "1",
        name: "Admin User",
        role: ["ADMIN"],
      },
      expires: "2024-12-31T23:59:59.999Z",
    };

    const citizenSession = {
      user: {
        id: "2",
        name: "Citizen User",
        role: ["CITIZEN"],
      },
      expires: "2024-12-31T23:59:59.999Z",
    };

    beforeEach(() => {
      (ReportAssignmentService.getInstance as jest.Mock).mockReturnValue(
        mockAssignmentService,
      );
    });

    it("should assign report to company successfully when user is TECHNICAL_OFFICER", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(officerSession);
      mockAssignmentService.assignReportToCompany.mockResolvedValue({
        success: true,
        data: "Report assigned to company Enel X and employee ID: emp123",
        access: true,
        email: "employee@enel.com",
      });

      const response = await assignReportToCompany(1, "company_enel");

      expect(response.success).toBe(true);
      expect(
        mockAssignmentService.assignReportToCompany,
      ).toHaveBeenCalledWith(1, "company_enel");
      if (response.success) {
        expect(response.data).toContain("Report assigned to company Enel X");
      }
    });

    it("should return error when user is not TECHNICAL_OFFICER (CITIZEN)", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(citizenSession);

      const response = await assignReportToCompany(1, "company_enel");

      expect(response.success).toBe(false);
      expect(
        mockAssignmentService.assignReportToCompany,
      ).not.toHaveBeenCalled();
      if (!response.success) {
        expect(response.error).toBe("Unauthorized access");
      }
    });

    it("should return error when user is ADMIN but not TECHNICAL_OFFICER", async () => {
      const adminOnlySession = {
        user: {
          id: "1",
          name: "Admin Only",
          role: ["ADMIN"],
        },
        expires: "2024-12-31T23:59:59.999Z",
      };

      (getServerSession as jest.Mock).mockResolvedValue(adminOnlySession);

      const response = await assignReportToCompany(1, "company_enel");

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Unauthorized access");
      }
    });

    it("should return error when no session exists", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await assignReportToCompany(1, "company_enel");

      expect(response.success).toBe(false);
      expect(
        mockAssignmentService.assignReportToCompany,
      ).not.toHaveBeenCalled();
      if (!response.success) {
        expect(response.error).toBe("Unauthorized access");
      }
    });

    it("should return error when service fails", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(officerSession);
      mockAssignmentService.assignReportToCompany.mockRejectedValue(
        new Error("Failed to assign report to company")
      );

      const response = await assignReportToCompany(1, "invalid_company");

      expect(response.success).toBe(false);
      expect(
        mockAssignmentService.assignReportToCompany,
      ).toHaveBeenCalledWith(1, "invalid_company");
      if (!response.success) {
        expect(response.error).toBe("Failed to assign report to company");
      }
    });

    it("should include company access information in response", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(officerSession);
      mockAssignmentService.assignReportToCompany.mockResolvedValue({
        success: true,
        data: "Report assigned to company Test Company and employee ID: emp456",
        access: false,
        email: "emp456@test.com",
      });

      const response = await assignReportToCompany(1, "test_company");

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.access).toBe(false);
        expect(response.email).toBe("emp456@test.com");
      }
    });

    it("should handle null email from employee", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(officerSession);
      mockAssignmentService.assignReportToCompany.mockResolvedValue({
        success: true,
        data: "Report assigned to company Enel X and employee ID: emp123",
        access: true,
        email: null,
      });

      const response = await assignReportToCompany(1, "company_enel");

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.email).toBeNull();
      }
    });
  });

  describe("getReportsByMaintainerId - Story 25", () => {
    const maintainerSession = {
      user: {
        id: "maintainer1",
        role: ["EXTERNAL_MAINTAINER_WITH_ACCESS"],
      },
      expires: "2024-12-31T23:59:59.999Z",
    };
    
    const officerSession = {
       user: {
        id: "officer1",
        role: ["TECHNICAL_OFFICER"],
      },
      expires: "2024-12-31T23:59:59.999Z",
    };

    beforeEach(() => {
        (ReportRetrievalService.getInstance as jest.Mock).mockReturnValue(mockRetrievalService);
    });

    it("should retrieve reports successfully when user is EXTERNAL_MAINTAINER_WITH_ACCESS", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(maintainerSession);
      const mockReports = [
        { id: "1", title: "Maintainer Task 1", status: "assigned" }
      ];
      
      mockRetrievalService.retrieveReportsByMaintainerId.mockResolvedValue({
        success: true,
        data: mockReports,
      });

      const response = await getReportsByMaintainerId();

      expect(response.success).toBe(true);
      expect(mockRetrievalService.retrieveReportsByMaintainerId).toHaveBeenCalledWith("maintainer1");
      if (response.success) {
        expect(response.data).toEqual(mockReports);
      }
    });

    it("should retrieve reports successfully when user is TECHNICAL_OFFICER", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(officerSession);
      mockRetrievalService.retrieveReportsByMaintainerId.mockResolvedValue({
        success: true,
        data: [],
      });

      const response = await getReportsByMaintainerId();

      expect(response.success).toBe(true);
      expect(mockRetrievalService.retrieveReportsByMaintainerId).toHaveBeenCalledWith("officer1");
    });

    it("should return unauthorized error when user is CITIZEN", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(citizenSession);

      const response = await getReportsByMaintainerId();

      expect(response.success).toBe(false);
      expect(mockRetrievalService.retrieveReportsByMaintainerId).not.toHaveBeenCalled();
      if (!response.success) {
        expect(response.error).toBe("Unauthorized access");
      }
    });

    it("should return unauthorized error when session is null", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await getReportsByMaintainerId();

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Unauthorized access");
      }
    });
  });
});
