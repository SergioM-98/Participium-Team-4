import { ReportRepository } from "../../../src/app/lib/repositories/report.repository";
import { ReportAssignmentService } from "../../../src/app/lib/services/reportAssignment.service";

const mockRepository = {
  getOfficerWithLeastReports: jest.fn(),
  assignReportToOfficer: jest.fn(),
  rejectReport: jest.fn(),
  getInstance: jest.fn(),
};

jest.mock('@/app/lib/repositories/report.repository', () => {
  return {
    ReportRepository: {
      getInstance: jest.fn(),
    },
  };
});

describe('ReportAssignment Service - Story 6', () => {
    let reportAssignmentService: ReportAssignmentService;

    beforeEach(() => {
        (ReportRepository.getInstance as jest.Mock).mockReturnValue(mockRepository);
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

            const response = await reportAssignmentService.assignReportToOfficer(
                1,
                'DEPARTMENT_OF_COMMERCE'
            );

            expect(response.success).toBe(false);
            expect(mockRepository.getOfficerWithLeastReports).toHaveBeenCalled();
            expect(mockRepository.assignReportToOfficer).not.toHaveBeenCalled();
            if (!response.success) {
                expect(response.error).toBe('No officers available in the specified department');
            }
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

            const response = await reportAssignmentService.assignReportToOfficer(
                1,
                'DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES'
            );

            expect(response.success).toBe(false);
            if (!response.success) {
                expect(response.error).toBe('Failed to assign report to officer');
            }
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
                expect(response.error).toBe('Failed to reject report');
            }
        });
    });
});
