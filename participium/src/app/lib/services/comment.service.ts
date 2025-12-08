import { CommentRepository } from "../repositories/comment.repository";
import { CommentWithAuthor } from "../dtos/comment.dto";

class CommentService {
  private static instance: CommentService;
  private readonly commentRepository: CommentRepository;

  private constructor() {
    this.commentRepository = CommentRepository.getInstance();
  }

  public static getInstance(): CommentService {
    if (!CommentService.instance) {
      CommentService.instance = new CommentService();
    }
    return CommentService.instance;
  }

  public async createComment(
    content: string,
    authorId: string,
    reportId: bigint,
  ): Promise<CommentWithAuthor> {
    return this.commentRepository.createComment({
      content,
      authorId,
      reportId,
    });
  }

  public async getCommentsByReport(
    reportId: bigint,
  ): Promise<CommentWithAuthor[]> {
    return this.commentRepository.getCommentsByReport(reportId);
  }
}

export default CommentService;
