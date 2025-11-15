import { ReportRepository } from "@/repositories/report.repository";
import { AssignReportToOfficerResponse } from "../dtos/report.dto";

class ReportAssignmentService {
  private static instance: ReportAssignmentService;
  private reportRepository: ReportRepository;

  private constructor() {
    this.reportRepository = ReportRepository.getInstance();
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
    // Implementation goes here
    // I'll just assign it to the officer with the least reports in the given department
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

      await this.reportRepository.assignReportToOfficer(
        reportId,
        Number(officer.id)
      );

      return {
        success: true,
        data: `Report assigned to officer ID ${officer.id}`,
      };
    } catch (error) {
      return { success: false, error: "Failed to assign report to officer" };
    }
  }
}

export { ReportAssignmentService };
