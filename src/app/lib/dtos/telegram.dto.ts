import { z } from "zod";

const LinkTelegramAccountRequest = z.object({
  authToken: z.string(),
  chatId: z.number(),
  username: z.string(),
});

export type LinkTelegramAccountRequest = z.infer<
  typeof LinkTelegramAccountRequest
>;

export type LinkTelegramAccountResponse =
  | { success: true; data: string }
  | { success: false; error: string };

export type AuthenticationCheckResponse =
  | { success: true; data: string }
  | { success: false; error: string };
