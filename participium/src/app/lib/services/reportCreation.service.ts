import { ReportRegistrationRequest, ReportRegistrationResponse } from "@/dtos/report.dto";
import { ReportRepository } from "@/repositories/report.repository";

class ReportCreationService {
  private static instance: ReportCreationService;
  private readonly reportRepository: ReportRepository;
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
    data: ReportRegistrationRequest
  ): Promise<ReportRegistrationResponse> {
    return await this.reportRepository.createReport(data);
  }
}

export { ReportCreationService };
