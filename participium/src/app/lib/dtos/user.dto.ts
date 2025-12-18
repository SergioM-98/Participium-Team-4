import { z } from "zod";
import { Role, Offices } from "@prisma/client";

const BaseUserSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.email("Invalid email").optional(),
    username: z.string().min(3, "Username must be at least 3 characters"),
    role: z.array(z.enum(Role)).min(1, "At least one role is required"),    
    office: z.array(z.enum(Offices)).default([]),
    telegram: z.string().optional(),
    companyId: z.string().optional(),
  })
  .refine(
    (data) =>
      ((data.role.includes("PUBLIC_RELATIONS_OFFICER") ||
        data.role.includes("TECHNICAL_OFFICER")) &&
        data.office.length > 0) ||
      (!data.role.includes("PUBLIC_RELATIONS_OFFICER") &&
        !data.role.includes("TECHNICAL_OFFICER") &&
        data.office.length === 0),
    {
      message: "Only OFFICER can have offices",
      path: ["office"],
    },
  )
  .refine(
    (data) =>
      (data.role.includes("CITIZEN") && data.email) ||
      (!data.role.includes("CITIZEN") && !data.email),
    {
      message: "Only CITIZEN can have an email",
      path: ["email"],
    },
  )
  .refine(
    (data) => {
      if (data.role.includes("CITIZEN")) {
        return true;
      }

      return !data.telegram;
    },
    {
      message: "Only CITIZEN can have a telegram account",
      path: ["telegram"],
    },
  )
  .refine(
    (data) => {
      const isExternalMaintainer =
        data.role.includes("EXTERNAL_MAINTAINER_WITH_ACCESS");

      if (isExternalMaintainer) {
        return !!data.companyId;
      }

      return !data.companyId;
    },
    {
      message: "Only EXTERNAL_MAINTAINER roles must have a company assigned",
      path: ["companyId"],
    },
  )
  .refine(
    (data) => {
      if (
        data.role.includes("CITIZEN") ||
        data.role.includes("EXTERNAL_MAINTAINER_WITH_ACCESS")
      ) {
        return data.role.length === 1;
      }

      return true;
    },
    {
      message:
        "CITIZEN and EXTERNAL_MAINTAINER roles cannot be combined with other roles",
      path: ["role"],
    },
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
    role: z.array(z.enum(Role)),
    office: z.array(z.enum(Offices)).default([]),
    telegram: z.boolean,
    pendingRequest: z.boolean,
    companyId: z.string().optional(),
  })
  .refine(
    (data) =>
      ((data.role.includes("PUBLIC_RELATIONS_OFFICER") ||
        data.role.includes("TECHNICAL_OFFICER")) &&
        data.office.length > 0) ||
      (!data.role.includes("PUBLIC_RELATIONS_OFFICER") &&
        !data.role.includes("TECHNICAL_OFFICER") &&
        data.office.length === 0),
    {
      message: "Only OFFICER can have offices",
      path: ["office"],
    },
  )
  .refine(
    (data) =>
      (data.role.includes("CITIZEN") && data.email) ||
      (!data.role.includes("CITIZEN") && !data.email),
    {
      message: "Only CITIZEN can have an email",
      path: ["email"],
    },
  )
  .refine(
    (data) => {
      if (data.role.includes("CITIZEN")) {
        return true;
      }

      return !data.telegram;
    },
    {
      message: "Only CITIZEN can have a telegram account",
      path: ["telegram"],
    },
  )
  .refine(
    (data) => {
      const isExternalMaintainer =
        data.role.includes("EXTERNAL_MAINTAINER_WITH_ACCESS");

      if (isExternalMaintainer) {
        return !!data.companyId;
      }

      return !data.companyId;
    },
    {
      message: "Only EXTERNAL_MAINTAINER roles must have a company assigned",
      path: ["companyId"],
    },
  )
  .refine(
    (data) => {
      if (
        data.role.includes("CITIZEN") ||
        data.role.includes("EXTERNAL_MAINTAINER_WITH_ACCESS")
      ) {
        return data.role.length === 1;
      }

      return true;
    },
    {
      message:
        "CITIZEN and EXTERNAL_MAINTAINER roles cannot be combined with other roles",
      path: ["role"],
    },
  );

export const OfficerUserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  role: z.array(z.enum(Role)),
  office: z.array(z.enum(Offices)).default([]),
});

export const LoginInputSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8),
});

export const UserAuthorSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().nullable(),
  username: z.string(),
});

export const TestUserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().nullable(),
  username: z.string(),
  role: z.enum(Role),
  passwordHash: z.string(),
  office: z.enum(Offices).nullable().optional(),
  telegramChatId: z.string().nullable().optional(),
  telegramToken: z.string().nullable().optional(),
  companyId: z.string().nullable().optional(),
});

type RetrievedUserData = z.infer<typeof RetrievedUserDataSchema>;
export type UserAuthor = z.infer<typeof UserAuthorSchema>;
export type Citizen = z.infer<typeof CitizenSchema>;
export type RegistrationInput = z.infer<typeof RegistrationInputSchema>;
export type CheckDuplicatesResponse = z.infer<
  typeof CheckDuplicatesResponseSchema
>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
export type TestUser = z.infer<typeof TestUserSchema>;

export type RegistrationResponse =
  | { success: true; data: string; pendingVerification?: boolean }
  | { success: false; error: string };

export type LoginResponse =
  | { success: true; data: RetrievedUserData }
  | { success: false; error: string };
export type MeType = {
    me: z.infer<typeof RetrievedUserDataSchema>;
    emailNotifications: boolean;
    telegramNotifications: boolean;
    companyName?: string
};

export type getAllOfficersResponse = {
  success: true;
  data: z.infer<typeof OfficerUserSchema>[];
} | {
  success: false;
  error: string;
};
