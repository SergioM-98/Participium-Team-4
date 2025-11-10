import { z } from "zod";

export const roleValues = ["CITIZEN", "OFFICER", "ADMIN"] as const;
export const categoryValues = [
  "DEPARTMENT_OF_COMMERCE",
  "DEPARTMENT_OF_EDUCATIONAL_SERVICES",
  "DEPARTMENT_OF_DECENTRALIZATION_AND_CIVIC_SERVICES",
  "DEPARTMENT_OF_SOCIAL_HEALTH_AND_HOUSING_SERVICES",
  "DEPARTMENT_OF_INTERNAL_SERVICES",
  "DEPARTMENT_OF_CULTURE_SPORT_MAJOR_EVENTS_AND_TOURISM_PROMOTION",
  "DEPARTMENT_OF_FINANCIAL_RESOURCES",
  "DEPARTMENT_OF_GENERAL_SERVICES_PROCUREMENT_AND_SUPPLIES",
  "DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES",
  "DEPARTMENT_OF_URBAN_PLANNING_AND_PRIVATE_BUILDING",
  "DEPARTMENT_OF_ENVIRONMENT_MAJOR_PROJECTS_INFRASTRUCTURE_AND_MOBILITY",
  "DEPARTMENT_OF_LOCAL_POLICE",
  "OTHER"
] as const;

const BaseUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email").optional(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  role: z.enum(roleValues),
  office: z.enum(Offices).optional(),
}).refine(
    (data) =>
      (data.role === "OFFICER" && data.office) ||
      (data.role !== "OFFICER" && !data.office),
    {
      message: "Only OFFICER can have an office",
      path: ["office"],
    }
  ).refine(
    (data) =>
      (data.role === "CITIZEN" && data.email) ||
      (data.role !== "CITIZEN" && !data.email),
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
  role: z.enum(roleValues),
  office: z.enum(categoryValues).optional(),
}).refine(
    (data) =>
      (data.role === "OFFICER" && data.office) ||
      (data.role !== "OFFICER" && !data.office),
    {
      message: "Only OFFICER can have an office",
      path: ["office"],
    }
  ).refine(
    (data) =>
      (data.role === "CITIZEN" && data.email) ||
      (data.role !== "CITIZEN" && !data.email),
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
