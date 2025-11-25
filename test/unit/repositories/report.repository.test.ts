import {RegistrationInput,
   } from "@/dtos/user.dto";
import { ReportRepository } from "@/app/lib/repositories/report.repository";
import { ReportRequest } from "@/app/lib/dtos/report.dto";



jest.mock('@/db/db', () => ({
    prisma: {
        report: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
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



        /*******************************/
        /* story 7 tests start here :-D*/

        /******** getReportById*********/
        /*******************************/

        it("should retrieve a report by id", async () => {
            mockedPrisma.report.findUnique.mockResolvedValue({
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
            mockedPrisma.report.findUnique.mockResolvedValue(null);
            const response = await reportRepository.getReportById("999");
            expect(response).toHaveProperty('success');
            expect(response).toHaveProperty('error');
            expect(response.success).toBe(false);
            if (!response.success) {
                expect(response.error).toBe("Report not found");
            }
        });

        it("should return error when db fails", async () => {
            mockedPrisma.report.findUnique.mockRejectedValue(new Error());
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






    })

    })