import {z} from "zod";

const ReportCategory = z.enum([
    'WATER_SUPPLY',
     'ARCHITECTURAL_BARRIERS', 
     'SEWER_SYSTEM',
      'PUBLIC_LIGHTING', 
     'WASTE',
     'ROADS_SIGNS_AND_TRAFFIC_LIGHTS',
     'ROADS_AND_URBAN_FURNISHINGS',
     'PUBLIC_GREEN_AREAS_AND_BACKGROUNDS',
     'OTHER']);


export const reportRequestSchema = z.object({
    title: z.string().min(5).max(100),
    description: z.string().min(10).max(1000),
    photos: z.array(z.string()).min(1).max(3),
    category: ReportCategory,
    longitude: z.number(),
    latitude: z.number(),
    userId: z.string(),
    isAnonymous: z.boolean()
});

export const reportResponseSchema = z.object({
    id: z.string(),
    title: z.string().min(5).max(100),
    description: z.string(),
    category: z.string(),
    createdAt: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Invalid date format'
    }),
    
});

export type ReportRequest = z.infer<typeof reportRequestSchema>;
export type ReportResponse = z.infer<typeof reportResponseSchema>;
export type ReportCategoryType = z.infer<typeof ReportCategory>;

export type ReportRegistrationResponse = 
  | { success: true; data: string }
  | { success: false; error: string };

  
export type RetriveReportResponse =
| { success: true; data: ReportRequest }
| { success: false; error: string };