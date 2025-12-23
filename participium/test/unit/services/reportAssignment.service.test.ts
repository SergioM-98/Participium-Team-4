import { ReportRepository } from "../../../src/app/lib/repositories/report.repository";
import { ReportAssignmentService } from "../../../src/app/lib/services/reportAssignment.service";
import { NotificationService } from "../../../src/app/lib/services/notification.service";

const mockRepository = {
  getOfficerWithLeastReports: jest.fn(),
  assignReportToOfficer: jest.fn(),
  rejectReport: jest.fn(),
  getInstance: jest.fn(),
  getCompanyById: jest.fn(),
  getCompanyEmployeeWithLeastReports: jest.fn(),
  assignReportToMaintainer: jest.fn(),
  assignReportToCompany: jest.fn(),
  getReportById: jest.fn(),
};

const mockNotificationService = {
  notifyStatusChange: jest.fn(),
  getInstance: jest.fn(),
};

jest.mock('@/app/lib/repositories/report.repository', () => {
  return {
    ReportRepository: {
      getInstance: jest.fn(),
    },
  };
});

jest.mock('@/app/lib/services/notification.service', () => {
  return {
    NotificationService: {
      getInstance: jest.fn(),
    },
  };
});

describe('ReportAssignment Service - Story 6', () => {
    let reportAssignmentService: ReportAssignmentService;

    beforeEach(() => {
        (ReportRepository.getInstance as jest.Mock).mockReturnValue(mockRepository);
        (NotificationService.getInstance as jest.Mock).mockReturnValue(mockNotificationService);
        reportAssignmentService = ReportAssignmentService.getInstance();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('assignReportToOfficer', () => {
        it("should assign report to officer with least reports successfully", async () => {
            const mockOfficer = {
                id: "2",
                firstName: 'Officer',
                lastName: 'One',
                _count: { reports: 1 }
            };

            mockRepository.getOfficerWithLeastReports.mockResolvedValue(mockOfficer);
            mockRepository.assignReportToOfficer.mockResolvedValue({ 
                id: BigInt(1),
                officerId: "2",
                status: 'ASSIGNED'
            });

            const response = await reportAssignmentService.assignReportToOfficer(
                1,
                'DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES'
            );

            expect(response.success).toBe(true);
            expect(mockRepository.getOfficerWithLeastReports).toHaveBeenCalledWith(
                'DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES'
            );
            expect(mockRepository.assignReportToOfficer).toHaveBeenCalledWith(
                1,
                "2"
            );
            if (response.success) {
                expect(response.data).toContain("Report assigned to officer ID");
            }
        });

        it("should return error when no officers available", async () => {
            mockRepository.getOfficerWithLeastReports.mockResolvedValue(null);

            await expect(
                reportAssignmentService.assignReportToOfficer(
                    1,
                    'DEPARTMENT_OF_COMMERCE'
                )
            ).rejects.toThrow('No available officers in department: DEPARTMENT_OF_COMMERCE');

            expect(mockRepository.getOfficerWithLeastReports).toHaveBeenCalled();
            expect(mockRepository.assignReportToOfficer).not.toHaveBeenCalled();
        });

        it("should return error when assignment fails", async () => {
            const mockOfficer = {
                id: "2",
                firstName: 'Officer',
                lastName: 'One',
                _count: { reports: 1 }
            };

            mockRepository.getOfficerWithLeastReports.mockResolvedValue(mockOfficer);
            mockRepository.assignReportToOfficer.mockRejectedValue(new Error('Database error'));

            await expect(
                reportAssignmentService.assignReportToOfficer(
                    1,
                    'DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES'
                )
            ).rejects.toThrow('Database error');
        });
    });

    describe('rejectReport', () => {
        it("should reject report with reason successfully", async () => {
            mockRepository.rejectReport.mockResolvedValue({ 
                id: BigInt(1),
                status: 'REJECTED',
                rejectionReason: 'Insufficient information'
            });

            const response = await reportAssignmentService.rejectReport(
                1,
                'Insufficient information'
            );

            expect(response.success).toBe(true);
            expect(mockRepository.rejectReport).toHaveBeenCalledWith(
                1,
                'Insufficient information'
            );
            if (response.success) {
                expect(response.data).toContain('Report rejected with reason');
            }
        });

        it("should return error when rejection fails", async () => {
            mockRepository.rejectReport.mockRejectedValue(new Error('Database error'));

            const response = await reportAssignmentService.rejectReport(
                1,
                'Test reason'
            );

            expect(response.success).toBe(false);
            expect(mockRepository.rejectReport).toHaveBeenCalled();
            if (!response.success) {
                expect(response.error).toBe('Failed to reject report with ID 1');
            }
        });
    });

    describe('assignReportToCompany - Story 24', () => {
        it("should assign report to company employee with least reports successfully", async () => {
            const mockCompany = {
                id: "company1",
                name: "Enel X",
                hasAccess: true,
            };

            const mockEmployee = {
                id: "employee1",
                firstName: "John",
                lastName: "Doe",
                email: "john@enel.com",
            };

            mockRepository.getCompanyById.mockResolvedValue(mockCompany);
            mockRepository.getCompanyEmployeeWithLeastReports.mockResolvedValue(mockEmployee);
            mockRepository.assignReportToMaintainer.mockResolvedValue({
                id: BigInt(1),
                maintainerId: "employee1",
                citizenId: BigInt(10),
                status: 'ASSIGNED'
            });
            mockRepository.assignReportToCompany.mockResolvedValue({
                id: BigInt(1),
                companyId: "company1",
            });
            mockNotificationService.notifyStatusChange.mockResolvedValue(true);

            const response = await reportAssignmentService.assignReportToCompany(
                1,
                'company1'
            );

            expect(response.success).toBe(true);
            expect(mockRepository.getCompanyById).toHaveBeenCalledWith('company1');
            expect(mockRepository.getCompanyEmployeeWithLeastReports).toHaveBeenCalledWith('company1');
            expect(mockRepository.assignReportToMaintainer).toHaveBeenCalledWith(1, "employee1");
            expect(mockRepository.assignReportToCompany).toHaveBeenCalledWith(1, "company1");
            
            if (response.success) {
                expect(response.data).toContain("Report assigned to company Enel X");
                expect(response.access).toBe(true);
                expect(response.email).toBe("john@enel.com");
            }
        });

        it("should return error when company not found", async () => {
            mockRepository.getCompanyById.mockResolvedValue(null);

            await expect(
                reportAssignmentService.assignReportToCompany(
                    1,
                    'invalid_company'
                )
            ).rejects.toThrow('Company with ID invalid_company not found');

            expect(mockRepository.getCompanyById).toHaveBeenCalledWith('invalid_company');
            expect(mockRepository.getCompanyEmployeeWithLeastReports).not.toHaveBeenCalled();
        });

        it("should return error when no employees available in company", async () => {
            const mockCompany = {
                id: "company1",
                name: "Enel X",
                hasAccess: true,
            };

            mockRepository.getCompanyById.mockResolvedValue(mockCompany);
            mockRepository.getCompanyEmployeeWithLeastReports.mockResolvedValue(null);

            await expect(
                reportAssignmentService.assignReportToCompany(
                    1,
                    'company1'
                )
            ).rejects.toThrow('No available employees in company ID: company1');

            expect(mockRepository.getCompanyById).toHaveBeenCalled();
            expect(mockRepository.getCompanyEmployeeWithLeastReports).toHaveBeenCalledWith('company1');
            expect(mockRepository.assignReportToMaintainer).not.toHaveBeenCalled();
        });

        it("should include hasAccess flag from company in response", async () => {
            const mockCompany = {
                id: "company1",
                name: "Company Without Access",
                hasAccess: false,
            };

            const mockEmployee = {
                id: "employee1",
                firstName: "Jane",
                lastName: "Smith",
                email: "jane@company.com",
            };

            mockRepository.getCompanyById.mockResolvedValue(mockCompany);
            mockRepository.getCompanyEmployeeWithLeastReports.mockResolvedValue(mockEmployee);
            mockRepository.getReportById.mockResolvedValue({
                success: true,
                data: {
                    id: BigInt(1),
                    citizenId: BigInt(10),
                },
            });
            mockRepository.assignReportToMaintainer.mockResolvedValue({
                id: BigInt(1),
                maintainerId: "employee1",
                citizenId: BigInt(10),
            });
            mockRepository.assignReportToCompany.mockResolvedValue({
                id: BigInt(1),
                companyId: "company1",
            });
            mockNotificationService.notifyStatusChange.mockResolvedValue(true);

            const response = await reportAssignmentService.assignReportToCompany(
                1,
                'company1'
            );

            expect(response.success).toBe(true);
            if (response.success) {
                expect(response.access).toBe(false);
            }
        });

        it("should not fail if notification service throws error", async () => {
            const mockCompany = {
                id: "company1",
                name: "Enel X",
                hasAccess: true,
            };

            const mockEmployee = {
                id: "employee1",
                firstName: "John",
                lastName: "Doe",
                email: "john@enel.com",
            };

            mockRepository.getCompanyById.mockResolvedValue(mockCompany);
            mockRepository.getCompanyEmployeeWithLeastReports.mockResolvedValue(mockEmployee);
            mockRepository.assignReportToMaintainer.mockResolvedValue({
                id: BigInt(1),
                maintainerId: "employee1",
                citizenId: BigInt(10),
            });
            mockRepository.assignReportToCompany.mockResolvedValue({
                id: BigInt(1),
                companyId: "company1",
            });
            mockNotificationService.notifyStatusChange.mockRejectedValue(new Error('Notification failed'));

            const response = await reportAssignmentService.assignReportToCompany(
                1,
                'company1'
            );

            expect(response.success).toBe(true);
            expect(mockNotificationService.notifyStatusChange).toHaveBeenCalled();
        });

        it("should handle employee without email", async () => {
            const mockCompany = {
                id: "company1",
                name: "Enel X",
                hasAccess: true,
            };

            const mockEmployee = {
                id: "employee1",
                firstName: "John",
                lastName: "Doe",
                email: null,
            };

            mockRepository.getCompanyById.mockResolvedValue(mockCompany);
            mockRepository.getCompanyEmployeeWithLeastReports.mockResolvedValue(mockEmployee);
            mockRepository.assignReportToMaintainer.mockResolvedValue({
                id: BigInt(1),
                maintainerId: "employee1",
                citizenId: BigInt(10),
            });
            mockRepository.assignReportToCompany.mockResolvedValue({
                id: BigInt(1),
                companyId: "company1",
            });
            mockNotificationService.notifyStatusChange.mockResolvedValue(true);

            const response = await reportAssignmentService.assignReportToCompany(
                1,
                'company1'
            );

            expect(response.success).toBe(true);
            if (response.success) {
                expect(response.email).toBeNull();
            }
        });
    });
});
