import {
  AssignReportToOfficerResponse,
  ReportListResponse,
  ReportRegistrationResponse,
  ReportRequest,
} from "@/dtos/report.dto";
import { ReportCreationService } from "@/services/reportCreation.service";
import { ReportRetrievalService } from "../services/reportRetrieval.service";
import { ReportAssignmentService } from "../services/reportAssignment.service";

class ReportController {
  async createReport(data: ReportRequest): Promise<ReportRegistrationResponse> {
    const reportCreationService = ReportCreationService.getInstance();
    return reportCreationService.createReport(data);
  }

  async getReportsByOfficerId(officerId: number): Promise<ReportListResponse> {
    const reportRetrievalService = ReportRetrievalService.getInstance();
    return reportRetrievalService.retrieveReportsByOfficerId(officerId);
  }

  async getUnassignedReports(): Promise<ReportListResponse> {
    const reportRetrievalService = ReportRetrievalService.getInstance();
    return reportRetrievalService.retrieveUnassignedReports();
  }

  async assignReportToOfficer(
    reportId: number,
    department: string
  ): Promise<AssignReportToOfficerResponse> {
    const reportAssignmentService = ReportAssignmentService.getInstance();
    return reportAssignmentService.assignReportToOfficer(reportId, department);
  }
}

export { ReportController };
