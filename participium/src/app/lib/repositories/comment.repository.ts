import { prisma } from "../../../../prisma/db";
import { Comment } from "@prisma/client";

export class CommentRepository {
    private static instance: CommentRepository;

    private constructor() { }

    public static getInstance(): CommentRepository {
        if (!CommentRepository.instance) {
            CommentRepository.instance = new CommentRepository();
        }
        return CommentRepository.instance;
    }

    public async createComment(data: { content: string; authorId: string; reportId: bigint }): Promise<Comment> {
        return prisma.comment.create({ data });
    }

    public async getCommentsByReport(reportId: bigint): Promise<Comment[]> {
        return prisma.comment.findMany({
            where: { reportId },
            orderBy: { createdAt: 'asc' },
            include: { 
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        username: true,
                    }
                }
            },
        });
    }
}
