import {
  ReportRegistrationResponse,
  ReportRequest,
  ReportsByOfficerIdResponse,
} from "@/dtos/report.dto";
import { ReportCreationService } from "@/services/reportCreation.service";
import { ReportRetrievalService } from "../services/reportRetrieval.service";

class ReportController {
  async createReport(data: ReportRequest): Promise<ReportRegistrationResponse> {
    const reportCreationService = ReportCreationService.getInstance();
    return reportCreationService.createReport(data);
  }

  async getReportsByOfficerId(
    officerId: number
  ): Promise<ReportsByOfficerIdResponse> {
    const reportRetrievalService = ReportRetrievalService.getInstance();
    return reportRetrievalService.retrieveReportsByOfficerId(officerId);
  }
}

export { ReportController };
