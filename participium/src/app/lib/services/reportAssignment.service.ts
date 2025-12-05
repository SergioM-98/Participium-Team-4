import { ReportRepository } from "@/repositories/report.repository";
import { AssignReportToOfficerResponse } from "@/dtos/report.dto";
import { NotificationService } from "@/services/notification.service";
import { AssignReportToMaintainerResponse } from "@/dtos/report.dto";

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
    department: string
  ): Promise<AssignReportToOfficerResponse> {
    
      const officer = await this.reportRepository.getOfficerWithLeastReports(
        department
      );

      if (!officer) {
        throw new Error(`No available officers in department: ${department}`);
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
    rejectionReason: string
  ): Promise<AssignReportToOfficerResponse> {
    let success = false;
    try {
      const report = await this.reportRepository.rejectReport(reportId, rejectionReason);
      if(report){
        //only set success if the report was found and rejected
        success = true;
      };
      // Notify the citizen that their report has been rejected
      
      await this.notificationService.notifyStatusChange(
        report.citizenId,
        BigInt(reportId),
        "REJECTED"
      );
    } catch (error) {
      console.error("Failed to send notification:", error);
    }

    if(success){
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

 
  public async assignReportToCompany(
    reportId: number,
    companyId: string
  ): Promise<AssignReportToMaintainerResponse> {
    const company = await this.reportRepository.getCompanyById(companyId);
    const access = company?.hasAccess ?? false;
    const employee = await this.reportRepository.getCompanyEmployeeWithLeastReports(
      companyId
    );

    if (!employee) {
      return {
        success: false,
        error: "No external maintainers available in the specified company",
      };
    }
    const report = await this.reportRepository.assignReportToMaintainer(
      reportId,
      employee.id
    );
    // Also store the company ID in the report
    await this.reportRepository.assignReportToCompany(reportId, companyId);

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
      data: `Report assigned to company ID ${companyId} and employee ID ${employee.id}`,
      access: access,
      email: employee.email || null,
      };
  }
}


export { ReportAssignmentService };
