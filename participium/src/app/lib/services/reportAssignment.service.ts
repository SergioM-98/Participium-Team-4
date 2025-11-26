import { ReportRepository } from "../repositories/report.repository";
import { AssignReportToOfficerResponse } from "../dtos/report.dto";
import { NotificationService } from "./notification.service";

class ReportAssignmentService {
  private static instance: ReportAssignmentService;
  private reportRepository: ReportRepository;
  private notificationService: NotificationService;

  private constructor() {
    this.reportRepository = ReportRepository.getInstance();
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): ReportAssignmentService {
    if (!ReportAssignmentService.instance) {
      ReportAssignmentService.instance = new ReportAssignmentService();
    }
    return ReportAssignmentService.instance;
  }

  public async assignReportToOfficer(
    reportId: number,
    department: string
  ): Promise<AssignReportToOfficerResponse> {
    try {
      const officer = await this.reportRepository.getOfficerWithLeastReports(
        department
      );

      if (!officer) {
        return {
          success: false,
          error: "No officers available in the specified department",
        };
      }

      const report = await this.reportRepository.assignReportToOfficer(
        reportId,
        officer.id
      );

      // Notify the citizen that their report has been assigned
      try {
        await this.notificationService.notifyStatusChange(
          report.citizenId,
          BigInt(reportId),
          "ASSIGNED"
        );
      } catch (error) {
        console.error("Failed to send notification:", error);
      }

      return {
        success: true,
        data: `Report assigned to officer ID ${officer.id}`,
      };
    } catch (error) {
      return { success: false, error: "Failed to assign report to officer" };
    }
  }

  public async rejectReport(
    reportId: number,
    rejectionReason: string
  ): Promise<AssignReportToOfficerResponse> {
    try {
      const report = await this.reportRepository.rejectReport(reportId, rejectionReason);

      // Notify the citizen that their report has been rejected
      try {
        await this.notificationService.notifyStatusChange(
          report.citizenId,
          BigInt(reportId),
          "REJECTED"
        );
      } catch (error) {
        console.error("Failed to send notification:", error);
      }

      return {
        success: true,
        data: `Report rejected with reason: ${rejectionReason}`,
      };
    } catch (error) {
      return { success: false, error: "Failed to reject report" };
    }
  }
}

export { ReportAssignmentService };
