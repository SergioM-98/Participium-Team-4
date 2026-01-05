import { ReportCreationService } from "@/services/reportCreation.service";
import { ReportRepository } from "@/repositories/report.repository";
import { ReportRequest } from "@/dtos/report.dto";

describe("ReportCreationService - Story 12", () => {
  const mockRepo = {
    createReport: jest.fn(),
    getReportById: jest.fn(),
    getReportsByOfficerId: jest.fn(),
    getPendingApprovalReports: jest.fn(),
    getOfficerWithLeastReports: jest.fn(),
    assignReportToOfficer: jest.fn(),
    rejectReport: jest.fn(),
    getApprovedReports: jest.fn(),
  } as unknown as ReportRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(ReportRepository, "getInstance")
      .mockReturnValue(mockRepo as ReportRepository);
  });

  it("should create a report for citizen", async () => {
    mockRepo.createReport.mockResolvedValue({ success: true, id: "r1" });
    const service = ReportCreationService.getInstance();
    const req: ReportRequest = {
      title: "title",
      description: "desc",
      photos: ["p1.jpg"],
      category: "OTHER",
      longitude: 10,
      latitude: 20,
      userId: "user1",
      isAnonymous: false,
    };
    const result = await service.createReport(req);
    expect(result.success).toBe(true);
    expect(mockRepo.createReport).toHaveBeenCalled();
  });

  it("should create an anonymous report", async () => {
    mockRepo.createReport.mockResolvedValue({ success: true, id: "r2" });
    const service = ReportCreationService.getInstance();
    const req: ReportRequest = {
      title: "anon",
      description: "desc",
      photos: [],
      category: "OTHER",
      longitude: 10,
      latitude: 20,
      userId: "",
      isAnonymous: true,
    };
    const result = await service.createReport(req);
    expect(result.success).toBe(true);
    expect(mockRepo.createReport).toHaveBeenCalledWith({
      category: "OTHER",
      description: "desc",
      isAnonymous: true,
      latitude: 20,
      longitude: 10,
      photos: [],
      title: "anon",
      userId: "",
    });
  });

  it("should pass the anonymous flag correctly to the repository", async () => {
    // Arrange
    mockRepo.createReport.mockResolvedValue({ success: true, data: "created" });
    const service = ReportCreationService.getInstance();

    // Input DTO (usually from Controller)
    const req = {
      title: "Anonymous Issue",
      description: "Description",
      photos: [],
      category: "OTHER",
      longitude: 0,
      latitude: 0,
      userId: "user1",
      anonymous: true, // Ensuring we use the field expected by the repo DTO
    };

    // Act
    await service.createReport(req as any);

    // Assert
    expect(mockRepo.createReport).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Anonymous Issue",
        anonymous: true,
      })
    );
  });
});
