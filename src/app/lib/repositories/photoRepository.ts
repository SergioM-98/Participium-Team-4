import {prisma } from "@/lib/db";

export class PhotoRepository {
    private static instance: PhotoRepository;

    private constructor() {}

    public static getInstance(): PhotoRepository {
        if (!PhotoRepository.instance) {
            PhotoRepository.instance = new PhotoRepository();
        }
        return PhotoRepository.instance;
    }

    public async create(data: {
            id: string;
            url: string;
            reportId?: string;
        }) {
            return await prisma.photo.create({
                data: {
                    id: data.id,
                    url: data.url,
                    reportId: data.reportId,
                    ...(data.reportId && { reportId: data.reportId })
                }
            });
    }

    // Altri metodi per gestire le foto (es. find, update, delete)
}
