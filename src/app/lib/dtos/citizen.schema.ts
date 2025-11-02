import { z } from "zod";

export const RegistrationInputSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const CitizenSchema = z.object({
  id: z.bigint(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const CheckDuplicatesResponseSchema = z.object({
  isExisting: z.boolean(),
});

export const RetrievedUserDataSchema = z.object({
  id: z.bigint(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  username: z.string(),
  role: z.string().optional(),
});

export const SessionPayloadSchema = z.object({
  id: z.bigint(),
  role: z.string().optional(),
  expiresAt: z.number(),
});

export const LoginInputSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(8),
});

type RetrievedUserData = z.infer<typeof RetrievedUserDataSchema>;
export type SessionPayload = z.infer<typeof SessionPayloadSchema>;
export type Citizen = z.infer<typeof CitizenSchema>;
export type RegistrationInput = z.infer<typeof RegistrationInputSchema>;
export type CheckDuplicatesResponse = z.infer<
  typeof CheckDuplicatesResponseSchema
>;
export type LoginInput = z.infer<typeof LoginInputSchema>;

export type RegistrationResponse =
  | { success: true; data: string }
  | { success: false; error: string };

export type LoginResponse =
  | { success: true; data: RetrievedUserData }
  | { success: false; error: string };
