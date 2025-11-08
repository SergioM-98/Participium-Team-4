import {z} from "zod";

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