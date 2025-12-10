import { z } from "zod";
import { UserAuthorSchema } from "@/app/lib/dtos/user.dto";

export const createCommentRequestSchema = z.object({
  content: z.string().min(1).max(1000),
  reportId: z.string().or(z.number()),
});

export const commentResponseSchema = z.object({
  id: z.number().or(z.bigint()),
  content: z.string(),
  createdAt: z.date().or(z.string()),
  reportId: z.number().or(z.bigint()),
  authorId: z.string(),
  author: UserAuthorSchema.optional(),
});

export const getReportCommentsResponseSchema = z.array(commentResponseSchema);

export const commentWithAuthorSchema = z.object({
  id: z.bigint(),
  content: z.string(),
  createdAt: z.date(),
  authorId: z.string(),
  reportId: z.bigint(),
  author: UserAuthorSchema,
});

export const testCommentSchema = z.object({
  id: z.bigint(),
  content: z.string(),
  createdAt: z.date(),
  authorId: z.string(),
  reportId: z.bigint(),
  author: UserAuthorSchema.optional(),
});

export const internalNoteSchema = z.object({
  id: z.string(),
  authorName: z.string(),
  content: z.string(),
  createdAt: z.date().or(z.string()),
});

export type CreateCommentRequest = z.infer<typeof createCommentRequestSchema>;
export type CommentResponse = z.infer<typeof commentResponseSchema>;
export type CommentWithAuthor = z.infer<typeof commentWithAuthorSchema>;
export type TestComment = z.infer<typeof testCommentSchema>;
export type InternalNote = z.infer<typeof internalNoteSchema>;

export type CreateCommentResponse =
  | { success: true; data: CommentWithAuthor }
  | { success: false; error: string };

export type GetReportCommentsResponse =
  | { success: true; data: CommentWithAuthor[] }
  | { success: false; error: string };
