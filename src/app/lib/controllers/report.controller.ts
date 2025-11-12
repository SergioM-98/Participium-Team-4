import { ReportRegistrationResponse, ReportRequest } from '@/dtos/report.dto';
import { ReportCreationService } from '@/services/reportCreation.service';

class ReportController {

    async createReport(data: ReportRequest): Promise<ReportRegistrationResponse> {
        const reportCreationService = ReportCreationService.getInstance();
        return reportCreationService.createReport(data);
    }
}

export { ReportController };