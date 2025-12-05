import { z } from "zod";

const messageSchema = z.object({
    id: z.bigint(),
    createdAt: z.string(),
    content: z.string(),
    authorId: z.string(),
    reportId: z.bigint(),
});

export type MessageSchema = z.infer<typeof messageSchema>;

export type SendMessageResponse =
  | { success: true; data: MessageSchema }
  | { success: false; error: string };