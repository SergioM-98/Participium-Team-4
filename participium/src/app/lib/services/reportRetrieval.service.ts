import {
  ReportsUnassignedResponse,
  ReportsByOfficerResponse,
} from "@/dtos/report.dto";
import { ReportRepository } from "@/repositories/report.repository";

class ReportRetrievalService {
  private static instance: ReportRetrievalService;
  private readonly reportRepository: ReportRepository;

  private constructor() {
    this.reportRepository = ReportRepository.getInstance();
  }

  public static getInstance(): ReportRetrievalService {
    if (!ReportRetrievalService.instance) {
      ReportRetrievalService.instance = new ReportRetrievalService();
    }
    return ReportRetrievalService.instance;
  }

  private normalizeStatus(status: string): string {
    return status.toLowerCase().replaceAll('_', "_");
  }

  public async retrieveReportsByOfficerId(
    officerId: string
  ): Promise<ReportsByOfficerResponse> {
    const reports = await this.reportRepository.getReportsByOfficerId(
      officerId
    );

    const transformedReports = reports.map((r: any) => ({
      id: r.id.toString(),
      title: r.title,
      description: r.description,
      photos: r.photos
        .map(
          (p: { filename?: string | null } | null | undefined) => p?.filename
        )
        .filter((f: unknown): f is string => typeof f === "string"),
      category: r.category,
      longitude: Number(r.longitude),
      latitude: Number(r.latitude),
      userId: r.citizenId.toString(),
      citizenId: r.citizenId.toString(),
      officerId: r.officerId?.toString(),
      citizen: r.citizen,
      createdAt: r.createdAt,
      status: this.normalizeStatus(r.status),
    }));

    return {
      success: true,
      data: transformedReports,
    };
  }


  public async retrievePendingApprovalReports(): Promise<ReportsUnassignedResponse> {
    try {
      const result = await this.reportRepository.getPendingApprovalReports();
      if (!result.success || !result.data) {
        return { success: false, error: "No pending approval reports found" };
      }
      const transformedReports = result.data.map((r: any) => ({
        id: r.id.toString(),
        title: r.title,
        description: r.description,
        photos: r.photos,
        category: r.category,
        longitude: Number(r.longitude),
        latitude: Number(r.latitude),
        citizen: r.citizen
          ? {
              id: r.citizen.id.toString(),
              firstName: r.citizen.firstName,
              lastName: r.citizen.lastName,
              email: r.citizen.email,
              username: r.citizen.username,
            }
          : null,
      }));
      return {
        success: true,
        data: transformedReports,
      };
    } catch (error) {
      console.error("Error retrieving pending approval reports:", error);
      return {
        success: false,
        error: "Failed to retrieve pending approval reports",
      };
    }
  }
}

export { ReportRetrievalService };
