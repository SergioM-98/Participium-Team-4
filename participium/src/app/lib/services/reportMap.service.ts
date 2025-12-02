import { ReportRepository } from "../repositories/report.repository";

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
    const approved = await this.reportRepository.getApprovedReports();
    const pending = await this.reportRepository.getPendingApprovalReports();
    const unapproved = await this.reportRepository.getUnapprovedReports();
      const data = [
        ...(approved.success && approved.data ? approved.data : []),
        ...(pending.success && pending.data ? pending.data : []),
        ...(unapproved.success && unapproved.data ? unapproved.data : []),
      ];
      return { success: true, data };
  }

  public async getReportById(id: string | number) {
    return this.reportRepository.getReportById(id);
  }
}

export { ReportMapService };