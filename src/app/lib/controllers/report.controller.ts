"use server";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ReportRegistrationResponse, ReportRequest, reportRequestSchema } from '@/dtos/report.dto';
import { ReportCreationService } from '@/services/reportCreation.service';
import { getServerSession } from 'next-auth/next';

   export async function createReport(
        title: string, 
        description: string, 
        photos: string[], 
        category: string, 
        longitude: number, 
        latitude: number,
        isAnonymous: boolean
    ): Promise<ReportRegistrationResponse> {
        const session = await getServerSession(authOptions); 
        if(!session || (session && session.user.role !== "CITIZEN")){
            return { success: false, error: "Unauthorized report" };
        }  
        const reportData = reportRequestSchema.safeParse({
            title,
            description,
            photos,
            category: category,
            longitude,
            latitude,
            userId: isAnonymous? 2 : session.user.id,
            isAnonymous
        });
        if(!reportData.success){
            return {
                success: false,
                error: "Invalid inputs"
            }
        }
        const reportCreationService = ReportCreationService.getInstance();
        return reportCreationService.createReport(reportData.data);
    }