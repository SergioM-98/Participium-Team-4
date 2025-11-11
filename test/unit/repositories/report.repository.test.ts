import {RegistrationInput,
   } from "@/dtos/user.dto";
import { ReportRepository } from "@/app/lib/repositories/report.repository";
import { ReportRequest } from "@/app/lib/dtos/report.dto";



jest.mock('@/db/db', () => ({
    prisma: {
        report: {
            create: jest.fn(),
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

    })