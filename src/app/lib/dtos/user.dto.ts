import { z } from "zod";
// @ts-expect-error
import { Role, Category } from "@prisma/client";

const BaseUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email").optional(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  role: z.enum(Role),
  office: z.enum(Category).optional(),
}).refine(
    (data) =>
      (data.role === Role.OFFICER && data.office) ||
      (data.role !== Role.OFFICER && !data.office),
    {
      message: "Only OFFICER can have an office",
      path: ["office"],
    }
  ).refine(
    (data) =>
      (data.role === Role.CITIZEN && data.email) ||
      (data.role !== Role.CITIZEN && !data.email),
    {
      message: "Only CITIZEN can have an email",
      path: ["email"],
    }
  );

export const RegistrationInputSchema = BaseUserSchema.safeExtend({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const CitizenSchema = BaseUserSchema.safeExtend({
  id: z.coerce.bigint(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const CheckDuplicatesResponseSchema = z.object({
  isExisting: z.boolean(),
});

export const RetrievedUserDataSchema = z.object({
  id: z.bigint(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email().optional(),
  username: z.string(),
  role: z.enum(Role),
  office: z.enum(Category).optional(),
}).refine(
    (data) =>
      (data.role === Role.OFFICER && data.office) ||
      (data.role !== Role.OFFICER && !data.office),
    {
      message: "Only OFFICER can have an office",
      path: ["office"],
    }
  ).refine(
    (data) =>
      (data.role === Role.CITIZEN && data.email) ||
      (data.role !== Role.CITIZEN && !data.email),
    {
      message: "Only CITIZEN can have an email",
      path: ["email"],
    }
  );

export const LoginInputSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8),
});

type RetrievedUserData = z.infer<typeof RetrievedUserDataSchema>;
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
