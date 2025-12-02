import { Update } from "next/dist/build/swc/types";
import {
  ReportsUnassignedResponse,
  ReportsByOfficerResponse,
  UpdateReportStatusResponse,
} from "../dtos/report.dto";
import { ReportRepository } from "../repositories/report.repository";
import { ReportStatus } from "@prisma/client";

class ReportUpdateService {
  private static instance: ReportUpdateService;
  private reportRepository: ReportRepository;

  private constructor() {
    this.reportRepository = ReportRepository.getInstance();
  }

  public static getInstance(): ReportUpdateService {
    if (!ReportUpdateService.instance) {
      ReportUpdateService.instance = new ReportUpdateService();
    }
    return ReportUpdateService.instance;
  }

  public async updateReportStatus(
    reportId: string,
    status: string
  ): Promise<UpdateReportStatusResponse> {
    try {
      status = this.normalizeStatus(status);

      if (!this.isValidStatus(status)) {
        return {
          success: false,
          error: "Invalid report status",
        };
      }

      const updatedReport = await this.reportRepository.updateReportStatus(
        reportId,
        status
      );

      return { success: true, data: "Report status updated successfully" };
    } catch (error) {
      return {
        success: false,
        error: "Failed to update report status",
      };
    }
  }

  private normalizeStatus(status: string): string {
    return status.toUpperCase().replace(/_/g, "_");
  }

  private isValidStatus(status: string): boolean {
    return Object.values(ReportStatus).includes(status as ReportStatus);
  }
}

export { ReportUpdateService };
