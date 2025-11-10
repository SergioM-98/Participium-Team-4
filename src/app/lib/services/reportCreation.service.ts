import {ReportRequest, reportResponseSchema, ReportResponse} from "@/dtos/report.dto";
import {ReportRepository} from "@/repositories/report.repository";

class ReportCreationService {
    private static instance: ReportCreationService
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
    public async createReport(data: ReportRequest): Promise<ReportResponse> {
        const uuid = crypto.randomUUID();
        if (data.isAnonymous) {
            data.userId = '2';
        }
        try {
            const report = await this.reportRepository.createReport(
                uuid,
                data.title,
                data.description,
                data.photos,
                data.category,
                data.longitude,
                data.latitude,
                data.userId
            );

            return reportResponseSchema.parse({
                id: (report as any).id,
                title: (report as any).title,
                description: (report as any).description,
                category: (report as any).category,
                createdAt: (report as any).createdAt.toISOString()
            });
        } catch (error) {
            console.error("Error creating report:", error);
            throw new Error("Failed to create report");
        }
    }
}

export { ReportCreationService };