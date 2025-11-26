import {RegistrationInput,
   } from "../../../src/app/lib/dtos/user.dto";
import { ReportRepository } from "../../../src/app/lib/repositories/report.repository";
import { ReportRequest } from "../../../src/app/lib/dtos/report.dto";



jest.mock('@/db/db', () => ({
    prisma: {
        report: {
            create: jest.fn(),
            update: jest.fn(),
        },
        user: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
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
            mockedPrisma.report.create = jest.fn().mockResolvedValue({
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
            mockedPrisma.report.create = jest.fn().mockResolvedValue({
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
                id: "2", 
                firstName: 'Officer', 
                lastName: 'Two', 
                _count: { reports: 1 } 
            };
            
            mockedPrisma.user.findFirst = jest.fn().mockResolvedValue(mockOfficer);
            
            const response = await reportRepository.getOfficerWithLeastReports('DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES');
            
            expect(response).not.toBeNull();
            expect(response!.id).toBe("2");
            expect(response!._count.reports).toBe(1);
        });

        it("should return null when no officers found in department", async () => {
            mockedPrisma.user.findFirst = jest.fn().mockResolvedValue(null);
            
            const response = await reportRepository.getOfficerWithLeastReports('DEPARTMENT_OF_COMMERCE');
            
            expect(response).toBeNull();
        });

        it("should throw error when database fails", async () => {
            mockedPrisma.user.findFirst = jest.fn().mockRejectedValue(new Error('Database error'));
            
            await expect(
                reportRepository.getOfficerWithLeastReports('DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES')
            ).rejects.toThrow('Database error');
        });
    })

    describe('assignReportToOfficer - Story 6', () => {
        it("should assign report to officer successfully", async () => {
            const mockUpdatedReport = {
                id: BigInt(1),
                officerId: "2",
                status: 'ASSIGNED',
                title: 'Test Report',
                description: 'Test',
                category: 'WASTE',
                createdAt: new Date(),
                longitude: 7.6869,
                latitude: 45.0703,
                citizenId: "10",
                rejectionReason: null,
            };
            
            mockedPrisma.report.update = jest.fn().mockResolvedValue(mockUpdatedReport);
            
            const response = await reportRepository.assignReportToOfficer(1, "2");
            
            expect(response).toBeDefined();
            expect(response.id).toBe(BigInt(1));
            expect(response.officerId).toBe("2");
            expect(response.status).toBe('ASSIGNED');
            expect(mockedPrisma.report.update).toHaveBeenCalledWith({
                where: { id: BigInt(1) },
                data: {
                    officerId: "2",
                    status: 'ASSIGNED',
                },
            });
        });

        it("should throw error when database fails", async () => {
            mockedPrisma.report.update = jest.fn().mockRejectedValue(new Error('Database error'));
            
            await expect(
                reportRepository.assignReportToOfficer(1, "2")
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
                citizenId: "10",
                officerId: null,
            };
            
            mockedPrisma.report.update = jest.fn().mockResolvedValue(mockRejectedReport);
            
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
            mockedPrisma.report.update = jest.fn().mockRejectedValue(new Error('Database error'));
            
            await expect(
                reportRepository.rejectReport(1, 'Test reason')
            ).rejects.toThrow('Database error');
        });



        /*******************************/
        /* story 7 tests start here :-D*/

        /******** getReportById*********/
        /*******************************/

        it("should retrieve a report by id", async () => {
            mockedPrisma.report.findUnique = jest.fn().mockResolvedValue({
                id: "1",
                title: "Sample Title",
                description: "Sample Description",
                longitude: 7.6930,
                latitude: 45.0682,
                createdAt: new Date().toISOString(),
                category: "ARCHITECTURAL_BARRIERS",
                status: "APPROVED",
                citizen: {
                    username: "SampleUser"
                },
                photos: [
                    {id: "photo1", url: "url1"},
                    {id: "photo2", url: "url2"}
                ]
            });
            const response = await reportRepository.getReportById("1");
            expect(response).toHaveProperty('success');
            expect(response).toHaveProperty('data');
            expect(response.success).toBe(true);
            if (response.success && response.data) {
                expect(response.data).toHaveProperty('id', '1');
                expect(response.data).toHaveProperty('title', 'Sample Title');
                expect(response.data).toHaveProperty('description', 'Sample Description');
                expect(response.data).toHaveProperty('longitude', 7.6930);
                expect(response.data).toHaveProperty('latitude', 45.0682);
                expect(response.data).toHaveProperty('createdAt');
                expect(response.data).toHaveProperty('category', 'ARCHITECTURAL_BARRIERS');
                expect(response.data).toHaveProperty('status', 'APPROVED');
                expect(response.data).toHaveProperty('citizen', {"username": "SampleUser"});
                expect(response.data).toHaveProperty('photos');
                if (response.data.photos) {
                    expect(response.data.photos).toHaveLength(2);
                }
            }

        });

        it("should return error when report not found", async () => {
            mockedPrisma.report.findUnique = jest.fn().mockResolvedValue(null);
            const response = await reportRepository.getReportById("999");
            expect(response).toHaveProperty('success');
            expect(response).toHaveProperty('error');
            expect(response.success).toBe(false);
            if (!response.success) {
                expect(response.error).toBe("Report not found");
            }
        });

        it("should return error when db fails", async () => {
            mockedPrisma.report.findUnique = jest.fn().mockRejectedValue(new Error());
            const response = await reportRepository.getReportById("1");
            expect(response).toHaveProperty('success');
            expect(response).toHaveProperty('error');
            expect(response.success).toBe(false);
            if (!response.success) {
                expect(response.error).toBe("Error retrieving report");
            }
        });

        /****************************/
        /*****getApprovedReports*****/
        /****************************/

        it("should retrieve approved reports for map", async () => {
            const mockReports = [
                {
                    id: "1",
                    title: "Report 1",
                    description: "Description 1",
                    longitude: 10,
                    latitude: 10,
                    createdAt: new Date().toISOString(),
                    category: "WATER_SUPPLY",
                    status: "APPROVED",
                    citizen: { username: "User1" },
                    photos: []
                },
                {
                    id: "2",
                    title: "Report 2",
                    description: "Description 2",
                    longitude: 20,
                    latitude: 20,
                    createdAt: new Date().toISOString(),
                    category: "ROAD_DAMAGE",
                    status: "APPROVED",
                    citizen: { username: "User2" },
                    photos: []
                }
            ];
            mockedPrisma.report.findMany = jest.fn().mockResolvedValue(mockReports);
            const response = await reportRepository.getApprovedReports();
            expect(response).toHaveProperty('success');
            expect(response).toHaveProperty('data');
            expect(response.success).toBe(true);
            if (response.success && response.data) {
                expect(response.data).toHaveLength(2);
            }
        });

        it("should return empty array when no approved reports found", async () => {
            mockedPrisma.report.findMany = jest.fn().mockResolvedValue([]);
            const response = await reportRepository.getApprovedReports();
            expect(response).toHaveProperty('success');
            expect(response).toHaveProperty('error');
            expect(response.success).toBe(false);
            if (!response.success && response.error) {
                expect(response.error).toEqual("No reports found");
            }
        });

        it("should return error when db fails while retrieving approved reports", async () => {
            mockedPrisma.report.findMany = jest.fn().mockRejectedValue(new Error());
            const response = await reportRepository.getApprovedReports();
            expect(response).toHaveProperty('success');
            expect(response).toHaveProperty('error');
            expect(response.success).toBe(false);
            if (!response.success) {
                expect(response.error).toBe("Error retrieving reports");
            }
        });

        /******************************/
        /* story 7 tests end here T.T */
        /******************************/


        /*********************************/
        /* story 8 tests starts here :-D */
        /*********************************/


        /******** getReportsByOfficerId *********/

        it("should retrieve reports assigned to a specific officer", async () => {
            const mockReports = [
                {
                    id: "1",
                    title: "Report 1",
                    description: "Description 1",
                    longitude: 10,
                    latitude: 10,
                    createdAt: new Date().toISOString(),
                    category: "WATER_SUPPLY",
                    status: "ASSIGNED",
                    citizen: { username: "User1" },
                    photos: []
                },
                {
                    id: "2",
                    title: "Report 2",
                    description: "Description 2",
                    longitude: 20,
                    latitude: 20,
                    createdAt: new Date().toISOString(),
                    category: "ROAD_DAMAGE",
                    status: "IN_PROGRESS",
                    citizen: { username: "User2" },
                    photos: []
                }
            ];
            mockedPrisma.report.findMany = jest.fn().mockResolvedValue(mockReports);
            const response = await reportRepository.getReportsByOfficerId("5");
            expect(Array.isArray(response)).toBe(true);
            expect(response).toHaveLength(2);
        });

        it("should return empty array when no reports found for the officer", async () => {
            mockedPrisma.report.findMany = jest.fn().mockResolvedValue([]);
            const response = await reportRepository.getReportsByOfficerId("5");
            expect(Array.isArray(response)).toBe(true);
            expect(response).toHaveLength(0);
        });


        /******************************/
        /* story 8 tests end here T.T */
        /******************************/




    })

    })