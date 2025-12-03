import { z } from "zod";

export const categoryEnum = z.enum([
  "WATER_SUPPLY",
  "ARCHITECTURAL_BARRIERS",
  "SEWER_SYSTEM",
  "PUBLIC_LIGHTING",
  "WASTE",
  "ROADS_SIGNS_AND_TRAFFIC_LIGHTS",
  "ROADS_AND_URBAN_FURNISHINGS",
  "PUBLIC_GREEN_AREAS_AND_BACKGROUNDS",
  "OTHER",
]);

export const reportBaseSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(1000),
  photos: z.array(z.string()).min(1).max(3),
  category: categoryEnum,
  longitude: z.number(),
  latitude: z.number(),
});

export const reportRequestSchema = reportBaseSchema.extend({
  userId: z.string(),
  isAnonymous: z.boolean(),
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

export type Report = z.infer<typeof reportBaseSchema>;
export type Category = z.infer<typeof categoryEnum>;

export type ReportRequest = z.infer<typeof reportRequestSchema>;
export type ReportResponse = z.infer<typeof reportResponseSchema>;

export type RetrieveReport = z.infer<typeof retrieveReportResponseSchema>;

export type RetrieveReportByAssignee = z.infer<
  typeof retrieveReportsByOfficerResponseSchema
>;

export type UnassignedReport = z.infer<
  typeof rertieveUnassignedReportResponseSchema
>;

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
