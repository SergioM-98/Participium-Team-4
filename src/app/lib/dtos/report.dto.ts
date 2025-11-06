import { z } from "zod";

// Qui devo cambiare quello che mi viene dato probabilmente ?

export const CreateReviewInputSchema = z.object({
  reportId: z.bigint(),
  decision: z.enum(["APPROVED", "REJECTED"]),
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

export type CreateReviewInput = z.infer<typeof CreateReviewInputSchema>;
export type CreateReviewResponse = z.infer<typeof CreateReviewResponseSchema>;
