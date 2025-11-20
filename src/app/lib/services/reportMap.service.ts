import { ReportRepository } from "@/repositories/report.repository";

class ReportMapService {
  private static instance: ReportMapService;
  private reportRepository: ReportRepository;

  private constructor() {
    this.reportRepository = ReportRepository.getInstance();
  }

  public static getInstance(): ReportMapService {
    if (!ReportMapService.instance) {
      ReportMapService.instance = new ReportMapService();
    }
    return ReportMapService.instance;
  }

  public async getReportsForMap() {
    return this.reportRepository.getApprovedReports();
  }

  public async getReportById(id: string | number) {
    return this.reportRepository.getReportById(id);
  }
}

export { ReportMapService };