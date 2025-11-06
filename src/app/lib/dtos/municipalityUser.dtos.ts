import { z } from "zod";

export const SetRoleInputSchema = z.object({
  id: z.bigint(),
  role: z.string().min(1, "Role is required"),
});

export const SetRoleResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

export type SetRoleInput = z.infer<typeof SetRoleInputSchema>;
export type SetRoleResponse = z.infer<typeof SetRoleResponseSchema>;
