import { ReportListResponse } from "@/dtos/report.dto";
import { ReportRepository } from "@/repositories/report.repository";

class ReportRetrievalService {
  private static instance: ReportRetrievalService;
  private reportRepository: ReportRepository;

  private constructor() {
    this.reportRepository = ReportRepository.getInstance();
  }

  public static getInstance(): ReportRetrievalService {
    if (!ReportRetrievalService.instance) {
      ReportRetrievalService.instance = new ReportRetrievalService();
    }
    return ReportRetrievalService.instance;
  }

  public async retrieveReportsByOfficerId(
    officerId: number
  ): Promise<ReportListResponse> {
    try {
      const reports = await this.reportRepository.getReportsByOfficerId(
        officerId
      );

      const transformedReports = reports.map((r) => ({
        id: r.id.toString(),
        title: r.title,
        description: r.description,
        photos: r.photos.map((p) => p.filename).filter((f) => f !== null),
        category: r.category,
        longitude: Number(r.longitude),
        latitude: Number(r.latitude),
      }));

      return {
        success: true,
        data: transformedReports,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to retrieve reports for the given officer ID",
      };
    }
  }

  public async retrieveUnassignedReports(): Promise<ReportListResponse> {
    try {
      const reports = await this.reportRepository.getUnassignedReports();

      const transformedReports = reports.map((r) => ({
        id: r.id.toString(),
        title: r.title,
        description: r.description,
        photos: r.photos.map((p) => p.filename).filter((f) => f !== null),
        category: r.category,
        longitude: Number(r.longitude),
        latitude: Number(r.latitude),
      }));

      return {
        success: true,
        data: transformedReports,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to retrieve unassigned reports",
      };
    }
  }
}

export { ReportRetrievalService };
