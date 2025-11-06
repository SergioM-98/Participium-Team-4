import {prisma } from "@/lib/db";

class ReportRepository {
    private static instance: ReportRepository;

    private constructor() {}

    public static getInstance(): ReportRepository {
        if (!ReportRepository.instance) {
            ReportRepository.instance = new ReportRepository();
        }
        return ReportRepository.instance;
    }

    public async createReport(uuid: string, title: string, description: string, photos: string[], longitude: number, latitude: number, userId: string): Promise<Report> {
        const report = await prisma.report.create({
            data: {
                id: uuid,
                title: title,
                description: description,
                photos: {
                    connect: photos.map(photoId => ({ id: photoId }))
                },
                longitude: longitude,
                latitude: latitude,
                userId: userId
            }
        });
        return report;
    }
}

export { ReportRepository };