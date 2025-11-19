// src/app/lib/dtos/map.dto.ts
import { z } from "zod";

// Schema per i bounds geografici inviati alla Server Action
export const BoundsSchema = z.object({
    north: z.number().min(-90).max(90),
    south: z.number().min(-90).max(90),
    east: z.number().min(-180).max(180),
    west: z.number().min(-180).max(180),
});

// Schema per i dati minimi del Report visualizzati sulla mappa
export const ReportSchema = z.object({
    id: z.string(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    title: z.string().min(1),
    category: z.string().min(1), 
});

// Inferenza dei tipi TypeScript dagli Schemi Zod
export type Report = z.infer<typeof ReportSchema>;
export type Bounds = z.infer<typeof BoundsSchema>;