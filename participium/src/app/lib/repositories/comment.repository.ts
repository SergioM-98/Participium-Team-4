import { prisma } from "../../../../prisma/db";
import { CommentWithAuthor } from "../dtos/comment.dto";

export class CommentRepository {
  private static instance: CommentRepository;

  private constructor() {}

  public static getInstance(): CommentRepository {
    if (!CommentRepository.instance) {
      CommentRepository.instance = new CommentRepository();
    }
    return CommentRepository.instance;
  }

  public async createComment(data: {
    content: string;
    authorId: string;
    reportId: bigint;
  }): Promise<CommentWithAuthor> {
    const comment = await prisma.comment.create({ data });

    return prisma.comment.findUnique({
      where: { id: comment.id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
          },
        },
      },
    }) as Promise<CommentWithAuthor>;
  }

  public async getCommentsByReport(
    reportId: bigint,
  ): Promise<CommentWithAuthor[]> {
    return prisma.comment.findMany({
      where: { reportId },
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
          },
        },
      },
    }) as Promise<CommentWithAuthor[]>;
  }
}
