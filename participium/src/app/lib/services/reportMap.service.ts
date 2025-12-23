import { ReportRepository } from "@/repositories/report.repository";

class ReportMapService {
  private static instance: ReportMapService;
  private readonly reportRepository: ReportRepository;

  private constructor() {
    this.reportRepository = ReportRepository.getInstance();
  }

  public static getInstance(): ReportMapService {
    if (!ReportMapService.instance) {
      ReportMapService.instance = new ReportMapService();
    }
    return ReportMapService.instance;
  }

  public async getReportsForMap(userId?: string, role?: string[]) {
    let approved, pending, unapproved;
    if (role?.includes("CITIZEN") && userId) {
      approved = await this.reportRepository.getApprovedReports(); // Se serve filtrare per citizenId, aggiungi citizenId al where
      pending = await this.reportRepository.getPendingApprovalReportsByCitizenId(userId);
      unapproved = await this.reportRepository.getUnapprovedReportsByCitizenId(userId);
    } else {
      approved = await this.reportRepository.getApprovedReports();
      pending = await this.reportRepository.getPendingApprovalReports("PENDING_APPROVAL");
      unapproved = await this.reportRepository.getUnapprovedReports();
    }
    const data = [
      ...(approved.success && approved.data ? approved.data : []),
      ...("success" in pending && pending.success && "data" in pending && pending.data ? pending.data : []),
      ...("success" in unapproved && unapproved.success && "data" in unapproved && unapproved.data ? unapproved.data : []),
    ];
    return { success: true, data };
  }


  public async getPublicApprovedReports() {
    return this.reportRepository.getApprovedReports();
  }

  public async getReportById(id: string | number) {
    return this.reportRepository.getReportById(id);
  }
}

export { ReportMapService };