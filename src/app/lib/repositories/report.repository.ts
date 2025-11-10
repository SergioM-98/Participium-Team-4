import { prisma } from "@/prisma/db";
import { Category } from "@prisma/client";

class ReportRepository {
    private static instance: ReportRepository;

    private constructor() {}

    public static getInstance(): ReportRepository {
        if (!ReportRepository.instance) {
            ReportRepository.instance = new ReportRepository();
        }
        return ReportRepository.instance;
    }

    public async createReport(uuid: string, title: string, description: string, photos: string[], category: string, longitude: number, latitude: number, userId: string){
        category = category.toUpperCase();
        const report = await prisma.report.create({
            data: {
                id: uuid,
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
        return report;
    }
}

export { ReportRepository };