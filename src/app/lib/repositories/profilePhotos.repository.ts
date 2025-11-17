import { prisma } from "@/prisma/db";

export class ProfilePhotoRepository {
    private static instance: ProfilePhotoRepository;

    private constructor() {}

    public static getInstance(): ProfilePhotoRepository {
        if (!ProfilePhotoRepository.instance) {
            ProfilePhotoRepository.instance = new ProfilePhotoRepository();
        }
        return ProfilePhotoRepository.instance;
    }

    public async create(data: {
            id: string;
            url: string;
            userId: number;
            size?: bigint;
            offset?: bigint;
            filename?: string;
        }) {

            const user = await prisma.users.findUnique({
                where: { id: data.userId }
            });

            if (!user) {
                throw new Error("User not found");
            }

            return prisma.profile_photos.upsert({
                where: { userId: data.userId },
                update: {
                    url: data.url,
                    size: data.size,
                    offset: data.offset,
                    filename: data.filename
                },
                create: {
                    id: data.id,
                    url: data.url,
                    size: data.size,
                    offset: data.offset,
                    filename: data.filename,
                    userId: data.userId
                }
            });
    }

    public async findById(id: string) {
        return await prisma.profile_photos.findUnique({
            where: { id }
        });
    }
    public async delete(id: string) {
        return await prisma.profile_photos.delete({
            where: { id }
        });
    }
}
