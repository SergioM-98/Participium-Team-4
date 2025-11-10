import { z } from "zod";

export const CreateRoleInputSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  level: z.number().min(1, "Role level must be at least 1"),
});

export const CreateRoleResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

export type CreateRoleInput = z.infer<typeof CreateRoleInputSchema>;
export type CreateRoleResponse = z.infer<typeof CreateRoleResponseSchema>;
