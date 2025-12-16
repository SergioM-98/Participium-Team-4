import { z } from "zod";

export const categoryEnum = z.enum([
  "WATER_SUPPLY",
  "ARCHITECTURAL_BARRIERS",
  "SEWER_SYSTEM",
  "PUBLIC_LIGHTING",
  "WASTE",
  "ROADS_SIGNS_AND_TRAFFIC_LIGHTS",
  "ROADS_AND_URBAN_FURNISHINGS",
  "PUBLIC_GREEN_AREAS_AND_BACKGROUNDS"
]);

export const reportBaseSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(1000),
  photos: z.array(z.string()).min(1).max(3),
  category: categoryEnum,
  longitude: z.number(),
  latitude: z.number(),
});

export const reportForMapSchema = reportBaseSchema.extend({
  id: z.string(),
  citizenUsername: z.string().optional(),
  citizenId: z.string().nullable().optional(),
  status: z.string().optional(),
  anonymous: z.boolean().optional(),
});

export const reportByIdSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  longitude: z.number(),
  latitude: z.number(),
  createdAt: z.string(),
  category: categoryEnum,
  status: z.string(),
  username: z.string().optional().nullable(),
  citizenId: z.string().optional().nullable(),
  anonymous: z.boolean(),
  photos: z.array(z.string()),
});

export const reportRequestSchema = reportBaseSchema.extend({
  userId: z.string(),
  isAnonymous: z.boolean(),
});

export const reportRegistrationRequestSchema = reportBaseSchema.extend({
  userId: z.string(),
  anonymous: z.boolean(),
});

export const retrieveReportResponseSchema = reportBaseSchema.extend({
  id: z.string(),
});

export const retrieveReportsByOfficerResponseSchema = reportBaseSchema.extend({
  id: z.string(),
  userId: z.string(),
  status: z.string().optional(),
  citizenId: z.string().or(z.number()).optional(),
  officerId: z.string().or(z.number()).nullable().optional(),
  createdAt: z.string().optional(),
  companyId: z.string().nullable().optional(),
  citizen: z
    .object({
      id: z.string().or(z.number()),
      username: z.string(),
    })
    .optional()
    .nullable(),
});

export const rertieveUnassignedReportResponseSchema = reportBaseSchema.extend({
  id: z.string(),
  citizen: z
    .object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      username: z.string(),
      email: z.email(),
    })
    .nullable(),
});

export const reportResponseSchema = z.object({
  id: z.string(),
  title: z.string().min(5).max(100),
  description: z.string(),
  category: z.string(),
  createdAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

export const testReportSchema = z.object({
  id: z.bigint(),
  title: z.string(),
  description: z.string(),
  citizenId: z.string(),
  longitude: z.number(),
  latitude: z.number(),
  status: z.string(),
  createdAt: z.date(),
  category: z.string().optional(),
  officerId: z.string().nullable().optional(),
  companyId: z.string().nullable().optional(),
});

export type Report = z.infer<typeof reportBaseSchema>;
export type Category = z.infer<typeof categoryEnum>;

export type ReportRequest = z.infer<typeof reportRequestSchema>;
export type ReportRegistrationRequest = z.infer<typeof reportRegistrationRequestSchema>;
export type ReportResponse = z.infer<typeof reportResponseSchema>;

export type RetrieveReport = z.infer<typeof retrieveReportResponseSchema>;

export type ReportForMap = z.infer<typeof reportForMapSchema>;

export type ReportById = z.infer<typeof reportByIdSchema>;

export type RetrieveReportByAssignee = z.infer<
  typeof retrieveReportsByOfficerResponseSchema
>;

export type UnassignedReport = z.infer<
  typeof rertieveUnassignedReportResponseSchema
>;

export type TestReport = z.infer<typeof testReportSchema>;

export type ReportsUnassignedResponse =
  | { success: true; data: UnassignedReport[] }
  | { success: false; error: string };

export type ReportsByOfficerResponse =
  | { success: true; data: RetrieveReportByAssignee[] }
  | { success: false; error: string };

export type ReportRegistrationResponse =
  | { success: true; data: string }
  | { success: false; error: string };

export type RetriveReportResponse =
  | { success: true; data: ReportRequest }
  | { success: false; error: string };

export type ReportListResponse =
  | { success: true; data: RetrieveReport[] }
  | { success: false; error: string };

export type AssignReportToOfficerResponse =
  | { success: true; data: string }
  | { success: false; error: string };

export type AssignReportToMaintainerResponse =
  | { success: true; data: string; access: boolean; email: string | null }
  | { success: false; error: string };
  
export type UpdateReportStatusResponse =
  | { success: true; data: string }
  | { success: false; error: string };

export type ReportForMapResponse = 
  | { success: true; data: ReportForMap[] }
  | { success: false; error: string };

export type ReportByIdResponse = 
  | { success: true; data: ReportById }
  | { success: false; error: string };