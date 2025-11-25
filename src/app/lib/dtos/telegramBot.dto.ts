import { z } from "zod";

export const telegramRegistrationSchema = z.object({
  token: z.string().min(20),
  telegramId: z.number(),
});

export const telegramAPIReportRequestSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  latitude: z.string().min(1),
  longitude: z.string().min(1),
  category: z.string().min(1),
  isAnonymous: z.boolean().optional().default(false),
  chatId: z.string().min(1),
});

export type TelegramRegistrationRequest = z.infer<
  typeof telegramRegistrationSchema
>;
export type TelegramAPIReportRequest = z.infer<
  typeof telegramAPIReportRequestSchema
>;
export type UserAuthenticationResponse =
  | { success: true; data: string }
  | { success: false; error: string };
