'use server'

import { reportRequestSchema, ReportResponse } from '@/dtos/report.dto';
import { ReportController } from '@/controllers/report.controller';

export async function createReport(
    title: string, 
    description: string, 
    photos: string[], 
    category: string, 
    longitude: number, 
    latitude: number, 
    userId: string,
    isAnonymous: boolean
): Promise<ReportResponse> {
    try {
        const reportData = reportRequestSchema.parse({
            title,
            description,
            photos,
            category: category.toLowerCase(),
            longitude,
            latitude,
            userId,
            isAnonymous
        });

        const reportController = new ReportController();
        const result = await reportController.createReport(reportData);
        
        return result;
    } catch (error) {
        console.error('Error in createReport action:', error);
        throw error;
    }
}