import { z } from "zod";

export const RegistrationInputSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const OfficerSchema = z.object({
  id: z.bigint(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const CheckDuplicatesResponseSchema = z.object({
  isExisting: z.boolean(),
});

export const PublicOfficerDataSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  username: z.string()
});

export const LoginInputSchema = z.object({
  username: z.string().min(3, "Invalid username"),
  password: z.string().min(8),
});

type PublicUserData = z.infer<typeof PublicOfficerDataSchema>;

export type Citizen = z.infer<typeof OfficerSchema>;
export type RegistrationInput = z.infer<typeof RegistrationInputSchema>;
export type CheckDuplicatesResponse = z.infer<
  typeof CheckDuplicatesResponseSchema
>;
export type LoginInput = z.infer<typeof LoginInputSchema>;

export type RegistrationResponse =
  | { success: true; data: string }
  | { success: false; error: string };

export type LoginResponse =
  | { success: true; data: PublicUserData }
  | { success: false; error: string };