import { z } from "zod";
import { Role, Offices } from "@prisma/client";

const BaseUserSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.email("Invalid email").optional(),
    username: z.string().min(3, "Username must be at least 3 characters"),
    role: z.enum(Role),
    office: z.enum(Offices).optional(),
    telegram: z.string().optional(),
    companyId: z.string().optional(),
  })
  .refine(
    (data) =>
      ((data.role === "PUBLIC_RELATIONS_OFFICER" ||
        data.role === "TECHNICAL_OFFICER") &&
        data.office) ||
      (data.role !== "PUBLIC_RELATIONS_OFFICER" &&
        data.role !== "TECHNICAL_OFFICER" &&
        !data.office),
    {
      message: "Only OFFICER can have an office",
      path: ["office"],
    }
  )
  .refine(
    (data) =>
      (data.role === "CITIZEN" && data.email) ||
      (data.role !== "CITIZEN" && !data.email),
    {
      message: "Only CITIZEN can have an email",
      path: ["email"],
    }
  )
  .refine(
    (data) => {
      if (data.role === "CITIZEN") {
        return true;
      }

      return !data.telegram;
    },
    {
      message: "Only CITIZEN can have a telegram account",
      path: ["telegram"],
    }
  )
  .refine(
    (data) => {
      const isExternalMaintainer =
        data.role === "EXTERNAL_MAINTAINER_WITH_ACCESS" ||
        data.role === "EXTERNAL_MAINTAINER_WITHOUT_ACCESS";

      if (isExternalMaintainer) {
        return !!data.companyId;
      }

      return !data.companyId;
    },
    {
      message: "Only EXTERNAL_MAINTAINER roles must have a company assigned",
      path: ["companyId"],
    }
  );

export const RegistrationInputSchema = BaseUserSchema.safeExtend({
  id: z.string(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z
    .string()
    .min(8, "Confirm Password must be at least 8 characters"),
});

export const CitizenSchema = BaseUserSchema.safeExtend({
  id: z.string(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const CheckDuplicatesResponseSchema = z.object({
  isExisting: z.boolean(),
});

export const RetrievedUserDataSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.email().optional(),
    username: z.string(),
    role: z.enum(Role),
    office: z.enum(Offices).optional(),
    telegram: z.boolean,
    pendingRequest: z.boolean,
    companyId: z.string().optional(),
  })
  .refine(
    (data) =>
      ((data.role === "PUBLIC_RELATIONS_OFFICER" || data.role === "TECHNICAL_OFFICER") && data.office) ||
      ((data.role !== "PUBLIC_RELATIONS_OFFICER" && data.role !== "TECHNICAL_OFFICER") && !data.office),
    {
      message: "Only OFFICER can and must have an office",
      path: ["office"],
    }
  )
  .refine(
    (data) =>
      (data.role === "CITIZEN" && data.email) ||
      (data.role !== "CITIZEN" && !data.email),
    {
      message: "Only CITIZEN can and must have an email",
      path: ["email"],
    }
  )
  .refine(
    (data) => {
      if (data.role === "CITIZEN") {
        return true;
      }

      return !data.telegram;
    },
    {
      message: "Only CITIZEN can have a telegram account",
      path: ["telegram"],
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
export type MeType = {
    me: z.infer<typeof RetrievedUserDataSchema>,
    emailNotifications: boolean,
    telegramNotifications: boolean
};
