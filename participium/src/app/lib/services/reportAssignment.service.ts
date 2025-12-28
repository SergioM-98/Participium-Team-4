import { ReportRepository } from "@/repositories/report.repository";
import {
  AssignReportToMaintainerResponse,
  AssignReportToOfficerResponse,
} from "@/dtos/report.dto";
import { NotificationService } from "@/services/notification.service";

class ReportAssignmentService {
  private static instance: ReportAssignmentService;
  private readonly reportRepository: ReportRepository;
  private readonly notificationService: NotificationService;

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
    department: string,
  ): Promise<AssignReportToOfficerResponse> {
    const officer =
      await this.reportRepository.getOfficerWithLeastReports(department);

    if (!officer) {
      throw new Error(`No available officers in department: ${department}`);
    }

    const report = await this.reportRepository.assignReportToOfficer(
      reportId,
      officer.id,
    );

    // Notify the citizen that their report has been assigned
    try {
      await this.notificationService.notifyStatusChange(
        report.citizenId,
        BigInt(reportId),
        "ASSIGNED",
      );
    } catch (error) {
      //don't fail the assignment if notification fails
      console.error("Failed to send notification:", error);
    }

    return {
      success: true,
      data: `Report assigned to officer ID ${officer.id}`,
    };
  }

  public async rejectReport(
    reportId: number,
    rejectionReason: string,
  ): Promise<AssignReportToOfficerResponse> {
    let success = false;
    try {
      const report = await this.reportRepository.rejectReport(
        reportId,
        rejectionReason,
      );
      if (report) {
        //only set success if the report was found and rejected
        success = true;
      }
      // Notify the citizen that their report has been rejected

      await this.notificationService.notifyStatusChange(
        report.citizenId,
        BigInt(reportId),
        "REJECTED",
      );
    } catch (error) {
      console.error("Failed to send notification:", error);
    }

    if (success) {
      return {
        success: true,
        data: `Report rejected with reason: ${rejectionReason}`,
      };
    } else {
      return {
        success: false,
        error: `Failed to reject report with ID ${reportId}`,
      };
    }
  }

  public async unassignReportsOfDeletedOfficer(
    reports: Array<{ id: bigint; status: string }>,
  ): Promise<boolean> {
    try {
      for (const report of reports) {
        if (report.status === "RESOLVED") {
          await this.reportRepository.removeOfficerFromReport(report.id);
        } else {
          await this.reportRepository.unassignOfficerFromReport(report.id);
        }
      }
      return true;
    } catch (error) {
      console.error("Failed to unassign reports:", error);
      return false;
    }
  }

  public async assignReportToCompany(
    reportId: number,
    companyId: string,
  ): Promise<AssignReportToMaintainerResponse> {
    const company = await this.reportRepository.getCompanyById(companyId);
    if (!company) {
      throw new Error(`Company with ID ${companyId} not found`);
    }
    const access = company.hasAccess ?? false;
    let employee = null;
    let report = null;

    if (access) {
      employee =
        await this.reportRepository.getCompanyEmployeeWithLeastReports(
          companyId,
        );

      if (!employee) {
        throw new Error(`No available employees in company ID: ${companyId}`);
      }

      report = await this.reportRepository.assignReportToMaintainer(
        reportId,
        employee.id,
      );
    } else {
      // If no access, just get the report without assigning a specific maintainer
      report = await this.reportRepository.getReportById(reportId);
      if (!report.success || !report.data) {
        throw new Error(`Report with ID ${reportId} not found`);
      }
      report = report.data;
    }

    // Store the company ID in the report
    await this.reportRepository.assignReportToCompany(reportId, companyId);

    // Notify the citizen that their report has been assigned
    try {
      await this.notificationService.notifyStatusChange(
        report.citizenId,
        BigInt(reportId),
        "ASSIGNED",
      );
    } catch (error) {
      console.error("Failed to send notification:", error);
    }

    let message = `Report assigned to company ${company.name}`;
    if (employee) {
      message += ` and employee ID ${employee.id}`;
    }

    return {
      success: true,
      data: message,
      access: access,
      email: employee?.email || null,
    };
  }
}

export { ReportAssignmentService };
