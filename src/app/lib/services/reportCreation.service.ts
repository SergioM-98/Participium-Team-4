import {
  ReportRequest,
  reportResponseSchema,
  ReportResponse,
  ReportRegistrationResponse,
} from "@/dtos/report.dto";
import { ReportRepository } from "@/repositories/report.repository";

class ReportCreationService {
  private static instance: ReportCreationService;
  private reportRepository: ReportRepository;
  private constructor() {
    this.reportRepository = ReportRepository.getInstance();
  }
  public static getInstance(): ReportCreationService {
    if (!ReportCreationService.instance) {
      ReportCreationService.instance = new ReportCreationService();
    }
    return ReportCreationService.instance;
  }
  public async createReport(
    data: ReportRequest
  ): Promise<ReportRegistrationResponse> {
    if (data.isAnonymous) {
      data.userId = "2";
    }
    return await this.reportRepository.createReport(
      data.title,
      data.description,
      data.photos,
      data.category,
      data.longitude,
      data.latitude,
      data.userId
    );
  }
}

export { ReportCreationService };
