import { z } from "zod";

export const CreateReviewInputSchema = z.object({
  reportId: z.bigint(),
  status: z.enum([
    "PENDING_APPROVAL",
    "ASSIGNED",
    "IN_PROGRESS",
    "SUSPENDED",
    "REJECTED",
    "RESOLVED",
  ]),
  explaination: z.string().optional(),
  category: z.enum([
    "WATER_SUPPLY",
    "ARCHITECTURAL_BARRIERS",
    "SEWER_SYSTEM",
    "PUBLIC_LIGHTING",
    "WASTE",
    "ROADS_SIGNS_AND_TRAFFIC_LIGHTS",
    "ROADS_AND_URBAN_FURNISHINGS",
    "PUBLIC_GREEN_AREAS_AND_BACKGROUNDS",
    "OTHER",
  ]),
});

export const CreateReviewResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

export const RetrieveReportsByStatusInputSchema = z.object({
  status: z.enum([
    "PENDING_APPROVAL",
    "ASSIGNED",
    "IN_PROGRESS",
    "SUSPENDED",
    "REJECTED",
    "RESOLVED",
  ]),
});

export const ReportSchema = z.object({
  id: z.bigint(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  status: z.string().nullable(),
  explaination: z.string().nullable(),
  assignedDepartment: z.bigint().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Report = z.infer<typeof ReportSchema>;
export type CreateReviewInput = z.infer<typeof CreateReviewInputSchema>;
export type CreateReviewResponse = z.infer<typeof CreateReviewResponseSchema>;
export type RetrieveReportsByStatusInput = z.infer<
  typeof RetrieveReportsByStatusInputSchema
>;

export type RetrieveReportsByStatusResponse =
  | { success: true; data: Report[] }
  | { success: false; error: string };

export const reportRequestSchema = z.object({
    title: z.string().min(5).max(100),
    description: z.string().min(10).max(1000),
    photos: z.array(z.string()).min(1).max(3),
    category: z.enum([
        'water_supply',
         'architectural_barriers', 
         'sewer_system',
          'public_lighting', 
         'waste',
         'roads_signs_and_traffic_lights',
         'roads_and_urban_furnishings',
         'public_green_areas_and_backgrounds',
         'other']),
    longitude: z.number(),
    latitude: z.number(),
    userId: z.string(),
    isAnonymous: z.boolean()
});

export const reportResponseSchema = z.object({
    title: z.string().min(5).max(100),
    createdAt: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Invalid date format'
    }),
    
});

export type ReportRequest = z.infer<typeof reportRequestSchema>;
export type ReportResponse = z.infer<typeof reportResponseSchema>;
