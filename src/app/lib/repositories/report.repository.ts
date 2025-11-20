import { prisma } from "@/prisma/db";
import { Category } from "@prisma/client";
import { ReportRegistrationResponse } from "../dtos/report.dto";

class ReportRepository {
    private static instance: ReportRepository;

    private constructor() {}

    public static getInstance(): ReportRepository {
        if (!ReportRepository.instance) {
            ReportRepository.instance = new ReportRepository();
        }
        return ReportRepository.instance;
    }


    public async getReportById(id: string | number) {
        try {
            const report = await prisma.report.findUnique({
                where: { id: typeof id === 'string' ? BigInt(id) : id },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    longitude: true,
                    latitude: true,
                    createdAt: true,
                    category: true,
                    status: true,
                    citizen: {
                        select: {
                            username: true,
                        }
                    },
                    photos: {
                        select: {
                            id: true,
                            url: true
                        }
                    }
                }
            });
            if (!report) {
                return { success: false, error: "Report not found" };
            }
            return { success: true, data: report };
        } catch (e) {
            return { success: false, error: "Error retrieving report" };
        }
    }

    public async createReport(title: string,
                            description: string, photos: string[],
                            category: string, longitude: number,
                            latitude: number, userId: string)
                            :Promise<ReportRegistrationResponse>{
        try{
            category = category.toUpperCase();
            const report = await prisma.report.create({
                data: {
                    title: title,
                    description: description,
                    photos: {
                        connect: photos.map(photoId => ({ id: photoId }))
                    },
                        category: Object.values(Category).includes(category as Category) 
                        ? category as Category 
                        : Category.OTHER,
                    longitude: longitude,
                    latitude: latitude,
                    citizenId: Number(userId)
                }
            });
            return {
                success: true,
                data: `Report with id: ${report.id} succesfuly created`
            }
        }catch{

            return {
                success:false,
                error: "Failed to add the report to the database"
            }
        }
    }

    public async getApprovedReports() {
        const where: any = { status: 'ASSIGNED' };
        try {
            const reports = await prisma.report.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    longitude: true,
                    latitude: true,
                    category: true,
                    citizen: {
                        select: {
                            username: true,
                        }
                    },
                }
            });
            if (!reports || reports.length === 0) {
                return { success: false, error: "No reports found" };
            }
            return { success: true, data: reports };
        } catch (e) {
            return { success: false, error: "Error retrieving reports" };
        }
    }
}

export { ReportRepository };