import { z } from "zod";

export const CompanyBaseSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  email: z.email().min(1, "Company email is required"),
  phone: z.string().optional(),
  hasAccess: z.boolean().default(false),
});

export const CompanySchema = CompanyBaseSchema.extend({
  id: z.string(),
});

export type Company = z.infer<typeof CompanySchema>;

export type CompanyRegistrationResponse =
  | { success: true; data: string }
  | { success: false; error: string };

export type CompaniesRetrievalResponse =
  | { success: true; data: Company[] }
  | { success: false; error: string };
