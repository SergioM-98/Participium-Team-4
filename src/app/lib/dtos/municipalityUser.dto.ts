import { z } from "zod";

export const SetRoleInputSchema = z.object({
  id: z.bigint(),
  role: z.string().min(1, "Role is required"),
});

export const SetRoleResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

export const MunicipalityUserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  role: z.string(),
  department: z.string(),
});

export type SetRoleInput = z.infer<typeof SetRoleInputSchema>;
export type SetRoleResponse = z.infer<typeof SetRoleResponseSchema>;
export type MunicipalityUser = z.infer<typeof MunicipalityUserSchema>;

export type RetrieveMunicipalityResponse =
  | { success: true; data?: MunicipalityUser[] }
  | { success: false; error: string };
