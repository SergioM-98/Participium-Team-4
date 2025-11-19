import { z } from "zod";

const NotificationsSchema = z
  .object({
    emailEnabled: z.boolean().default(true),
    telegramEnabled: z.boolean().default(false).optional(),
  });
export type Notifications = z.infer<typeof NotificationsSchema>;

export type NotificationsData = z.infer<typeof NotificationsSchema>;

export type NotificationsResponse =
  | { success: true; data: NotificationsData }
  | { success: false; error: string };