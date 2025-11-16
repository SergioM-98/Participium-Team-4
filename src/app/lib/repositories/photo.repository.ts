import { prisma } from "@/prisma/db";

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
            size?: bigint;
            offset?: bigint;
            filename?: string;
        }) {
            return await prisma.photo.create({
                data: {
                    id: data.id,
                    url: data.url,
                    reportId: data.reportId ? BigInt(data.reportId) : null,
                    size: data.size,
                    offset: data.offset,
                    filename: data.filename
                }
            });
    }

    public async update(id: string, data: {
            offset?: bigint;
        }) {
            return await prisma.photo.update({
                where: { id },
                data: {
                    ...(data.offset !== undefined && { offset: data.offset }),
                }
            });
    }

    public async findById(id: string) {
        return await prisma.photo.findUnique({
            where: { id }
        });
    }
    public async delete(id: string) {
        return await prisma.photo.delete({
            where: { id }
        });
    }
}
