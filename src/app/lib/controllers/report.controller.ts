'use server'
import { reportRequestSchema, ReportResponse } from '@/dtos/report.dto';
import { ReportCreationService } from '@/services/reportCreation.service';

export async function reportCreation(title: string, description: string, photos: string[], longitude: number, latitude: number, userId: string): Promise<ReportResponse> {
    try {
        const reportData = reportRequestSchema.parse({
            title,
            description,
            photos,
            longitude,
            latitude,
            userId
        });

        const reportCreationService = ReportCreationService.getInstance();
        const report = await reportCreationService.createReport(reportData);
        return report;
    } catch (error) {
        console.error('Error creating report:', error);
        throw error;
    }
}