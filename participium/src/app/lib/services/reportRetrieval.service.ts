import {
  ReportsUnassignedResponse,
  ReportsByOfficerResponse,
  ReportsByCitizenResponse,
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
    return status.toLowerCase().replaceAll("_", "_");
  }

  private buildAbsolutePhotoUrl(
    photoPath: string | null | undefined,
  ): string | null {
    if (!photoPath) return null;

    // If it's already an absolute URL, return as is
    if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
      return photoPath;
    }

    // Otherwise, prepend the backend URL
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
    return `${backendUrl}${photoPath}`;
  }

  public async retrieveReportsByOfficerId(
    officerId: string,
  ): Promise<ReportsByOfficerResponse> {
    const reports =
      await this.reportRepository.getReportsByOfficerId(officerId);

    const transformedReports = reports.map((r: any) => ({
      id: r.id.toString(),
      title: r.title,
      description: r.description,
      photos: r.photos
        .map(
          (p: { filename?: string | null } | null | undefined) => p?.filename,
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
      companyId: r.companyId?.toString(),
      status: this.normalizeStatus(r.status),
    }));

    return {
      success: true,
      data: transformedReports,
    };
  }

  public async retrieveReportsByMaintainerId(
    maintainerId: string,
  ): Promise<ReportsByOfficerResponse> {
    const reports =
      await this.reportRepository.getReportsByMaintainerId(maintainerId);

    const transformedReports = reports.map((r: any) => ({
      id: r.id.toString(),
      title: r.title,
      description: r.description,
      photos: r.photos
        .map(
          (p: { filename?: string | null } | null | undefined) => p?.filename,
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
      companyId: r.companyId?.toString(),
      status: this.normalizeStatus(r.status),
    }));

    return {
      success: true,
      data: transformedReports,
    };
  }

  public async retrieveReportsByCitizenTelegramChatId(
    telegramChatId: string,
  ): Promise<ReportsByCitizenResponse> {
    try {
      const reports =
        await this.reportRepository.retrieveReportsByCitizenTelegramChatId(
          telegramChatId,
        );
      const transformedReports = reports.map((r: any) => ({
        id: r.id.toString(),
        title: r.title,
        description: r.description,
        category: r.category,
        longitude: Number(r.longitude),
        latitude: Number(r.latitude),
        status: this.normalizeStatus(r.status),
        photos: Array.isArray(r.photos)
          ? r.photos
              .map(
                (
                  p:
                    | { url?: string | null; filename?: string | null }
                    | null
                    | undefined,
                ) => {
                  const photoPath = p?.url || p?.filename;
                  return this.buildAbsolutePhotoUrl(photoPath);
                },
              )
              .filter((f: unknown): f is string => typeof f === "string")
          : [],
      }));

      return {
        success: true,
        data: transformedReports,
      };
    } catch (error) {
      console.error(
        "Error retrieving reports by citizen telegram chat id:",
        error,
      );
      return { success: false, error: "Failed to retrieve reports" };
    }
  }

  public async retrieveReportByIdForCitizenTelegram(
    reportId: string,
    telegramChatId: string,
  ): Promise<ReportsByCitizenResponse> {
    try {
      const report =
        await this.reportRepository.getReportByIdForCitizenTelegram(
          reportId,
          telegramChatId,
        );

      if (!report) {
        return {
          success: false,
          error: "Report not found or you don't have access to it",
        };
      }

      const transformedReport = {
        id: report.id.toString(),
        title: report.title,
        description: report.description,
        category: report.category,
        longitude: Number(report.longitude),
        latitude: Number(report.latitude),
        status: this.normalizeStatus(report.status),
        photos: Array.isArray(report.photos)
          ? report.photos
              .map(
                (
                  p:
                    | { url?: string | null; filename?: string | null }
                    | null
                    | undefined,
                ) => {
                  const photoPath = p?.url || p?.filename;
                  return this.buildAbsolutePhotoUrl(photoPath);
                },
              )
              .filter((f: unknown): f is string => typeof f === "string")
          : [],
      };

      return {
        success: true,
        data: [transformedReport],
      };
    } catch (error) {
      console.error(
        "Error retrieving report by id for citizen telegram:",
        error,
      );
      return { success: false, error: "Failed to retrieve report" };
    }
  }

  public async retrievePendingApprovalReports(
    status: string,
  ): Promise<ReportsUnassignedResponse> {
    const reports =
      await this.reportRepository.getPendingApprovalReports(status);

    const transformedReports = reports.map((r: any) => ({
      id: r.id.toString(),
      title: r.title,
      description: r.description,
      photos: r.photos,
      category: r.category,
      longitude: Number(r.longitude),
      latitude: Number(r.latitude),
      companyId: r.companyId,
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
  }
}

export { ReportRetrievalService };
