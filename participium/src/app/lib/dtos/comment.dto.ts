import { z } from "zod";

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
  author: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().nullable(),
    username: z.string(),
  }).optional(),
});

export const getReportCommentsResponseSchema = z.array(commentResponseSchema);

export type CreateCommentRequest = z.infer<typeof createCommentRequestSchema>;
export type CommentResponse = z.infer<typeof commentResponseSchema>;
export type GetReportCommentsResponse = z.infer<typeof getReportCommentsResponseSchema>;
