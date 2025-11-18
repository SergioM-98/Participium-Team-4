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

            const user = await prisma.user.findUnique({
                where: { id: data.userId }
            });

            if (!user) {
                throw new Error("User not found");
            }

            return prisma.profilePhoto.upsert({
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
        return await prisma.profilePhoto.findUnique({
            where: { id }
        });
    }
    public async delete(id: string) {
        return await prisma.profilePhoto.delete({
            where: { id }
        });
    }

    public async getPhotoOfUser(userId: number | string) {

        if (typeof userId === 'string') {
            const user = await prisma.user.findUnique({
                where: { username: userId }
            });
            if (!user) {
                throw new Error("User not found");
            }
            userId = Number(user.id);
        }

        return await prisma.profilePhoto.findUnique({
            where: { userId }
        });
    }
}
