import {
  ReportsUnassignedResponse,
  ReportsByOfficerResponse,
} from "@/dtos/report.dto";
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

  private normalizeStatus(status: string): string {
    return status.toLowerCase().replace(/_/g, "_");
  }

  public async retrieveReportsByOfficerId(
    officerId: number
  ): Promise<ReportsByOfficerResponse> {
    try {
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
        status: this.normalizeStatus(r.status),
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

  public async retrievePendingApprovalReports(
    status: string
  ): Promise<ReportsUnassignedResponse> {
    try {
      const reports = await this.reportRepository.getPendingApprovalReports(
        status
      );

      const transformedReports = reports.map((r: any) => ({
        id: r.id.toString(),
        title: r.title,
        description: r.description,
        photos: r.photos
          .map((p: { url?: string | null } | null | undefined) => p?.url)
          .filter(
            (filename: unknown): filename is string =>
              typeof filename === "string"
          ),
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
