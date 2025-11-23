import {RegistrationInput,
   } from "@/dtos/user.dto";
import { ReportRepository } from "@/app/lib/repositories/report.repository";
import { ReportRequest } from "@/app/lib/dtos/report.dto";



jest.mock('@/db/db', () => ({
    prisma: {
        report: {
            create: jest.fn(),
            update: jest.fn(),
        },
        user: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
        },
    },
}));

const mockedPrisma = jest.requireMock('@/db/db').prisma;

describe('ReportRepository Story 4', () => {
    let reportRepository: ReportRepository = ReportRepository.getInstance();
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
        it("should create a new report and return success true", async () => {
            mockedPrisma.report.create.mockResolvedValue({
                ...mockData,
                id: 1
            });
            const response = await reportRepository.createReport(mockData.title, mockData.description,
                                                                mockData.photos, mockData.category,
                                                                mockData.longitude, mockData.latitude,
                                                                mockData.userId);
            expect(response).toHaveProperty('success');
            expect(response).toHaveProperty('data');
            expect(response.success).toBe(true);
            if (response.success) {
                expect(response.data).toBe("Report with id: 1 succesfuly created");
            }
        });

        it("should create a new report and return success true even with a wrong category (it assigns OTHER)", async () => {
            mockedPrisma.report.create.mockResolvedValue({
                ...mockData,
                id: 1
            });
            const response = await reportRepository.createReport(mockData.title, mockData.description,
                                                                mockData.photos, "",
                                                                mockData.longitude, mockData.latitude,
                                                                mockData.userId);
            expect(response).toHaveProperty('success');
            expect(response).toHaveProperty('data');
            expect(response.success).toBe(true);
            if (response.success) {
                expect(response.data).toBe("Report with id: 1 succesfuly created");
            }
        });

        it("should return success false if the db fails", async () => {
            mockedPrisma.report.create.mockRejectedValue(new Error());
            const response = await reportRepository.createReport(mockData.title, mockData.description,
                                                                mockData.photos, mockData.category,
                                                                mockData.longitude, mockData.latitude,
                                                                mockData.userId);
            expect(response).toHaveProperty('success');
            expect(response).toHaveProperty('error');
            expect(response.success).toBe(false);
            if (!response.success) {
                expect(response.error).toBe("Failed to add the report to the database");
            }
        });
    })

    describe('getOfficerWithLeastReports - Story 6', () => {
        it("should return officer with least reports", async () => {
            const mockOfficer = { 
                id: BigInt(2), 
                firstName: 'Officer', 
                lastName: 'Two', 
                _count: { reports: 1 } 
            };
            
            mockedPrisma.user.findFirst.mockResolvedValue(mockOfficer);
            
            const response = await reportRepository.getOfficerWithLeastReports('DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES');
            
            expect(response).not.toBeNull();
            expect(response!.id).toBe(BigInt(2));
            expect(response!._count.reports).toBe(1);
        });

        it("should return null when no officers found in department", async () => {
            mockedPrisma.user.findFirst.mockResolvedValue(null);
            
            const response = await reportRepository.getOfficerWithLeastReports('DEPARTMENT_OF_COMMERCE');
            
            expect(response).toBeNull();
        });

        it("should throw error when database fails", async () => {
            mockedPrisma.user.findFirst.mockRejectedValue(new Error('Database error'));
            
            await expect(
                reportRepository.getOfficerWithLeastReports('DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES')
            ).rejects.toThrow('Database error');
        });
    })

    describe('assignReportToOfficer - Story 6', () => {
        it("should assign report to officer successfully", async () => {
            const mockUpdatedReport = {
                id: BigInt(1),
                officerId: BigInt(2),
                status: 'ASSIGNED',
                title: 'Test Report',
                description: 'Test',
                category: 'WASTE',
                createdAt: new Date(),
                longitude: 7.6869,
                latitude: 45.0703,
                citizenId: BigInt(10),
                rejectionReason: null,
            };
            
            mockedPrisma.report.update.mockResolvedValue(mockUpdatedReport);
            
            const response = await reportRepository.assignReportToOfficer(1, 2);
            
            expect(response).toBeDefined();
            expect(response.id).toBe(BigInt(1));
            expect(response.officerId).toBe(BigInt(2));
            expect(response.status).toBe('ASSIGNED');
            expect(mockedPrisma.report.update).toHaveBeenCalledWith({
                where: { id: BigInt(1) },
                data: {
                    officerId: BigInt(2),
                    status: 'ASSIGNED',
                },
            });
        });

        it("should throw error when database fails", async () => {
            mockedPrisma.report.update.mockRejectedValue(new Error('Database error'));
            
            await expect(
                reportRepository.assignReportToOfficer(1, 2)
            ).rejects.toThrow('Database error');
        });
    })

    describe('rejectReport - Story 6', () => {
        it("should reject report with reason successfully", async () => {
            const mockRejectedReport = {
                id: BigInt(1),
                status: 'REJECTED',
                rejectionReason: 'Insufficient information',
                title: 'Test Report',
                description: 'Test',
                category: 'WASTE',
                createdAt: new Date(),
                longitude: 7.6869,
                latitude: 45.0703,
                citizenId: BigInt(10),
                officerId: null,
            };
            
            mockedPrisma.report.update.mockResolvedValue(mockRejectedReport);
            
            const response = await reportRepository.rejectReport(1, 'Insufficient information');
            
            expect(response).toBeDefined();
            expect(response.id).toBe(BigInt(1));
            expect(response.status).toBe('REJECTED');
            expect(response.rejectionReason).toBe('Insufficient information');
            expect(mockedPrisma.report.update).toHaveBeenCalledWith({
                where: { id: BigInt(1) },
                data: {
                    status: 'REJECTED',
                    rejectionReason: 'Insufficient information',
                },
            });
        });

        it("should throw error when database fails", async () => {
            mockedPrisma.report.update.mockRejectedValue(new Error('Database error'));
            
            await expect(
                reportRepository.rejectReport(1, 'Test reason')
            ).rejects.toThrow('Database error');
        });
    })

    })