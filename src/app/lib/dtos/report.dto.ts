import {z} from "zod";

export const reportRequestSchema = z.object({
    title: z.string().min(5).max(100),
    description: z.string().min(10).max(1000),
    photos: z.array(z.string()).min(1).max(3),
    longitude: z.number(),
    latitude: z.number(),
    userId: z.string(),
});

export const reportResponseSchema = z.object({
    title: z.string().min(5).max(100),
    createdAt: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Invalid date format'
    }),
    
});

export type ReportRequest = z.infer<typeof reportRequestSchema>;
export type ReportResponse = z.infer<typeof reportResponseSchema>;