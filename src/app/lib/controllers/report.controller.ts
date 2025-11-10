import { ReportRequest, ReportResponse } from '@/dtos/report.dto';
import { ReportCreationService } from '@/services/reportCreation.service';

class ReportController {

    async createReport(data: ReportRequest): Promise<ReportResponse> {
        try {
            const reportCreationService = ReportCreationService.getInstance();
            const report = await reportCreationService.createReport(data);
            return report;
        } catch (error) {
            console.error('Error creating report:', error);
            throw error;
        }
    }
}

export { ReportController };