import { z } from "zod";

export const TusResponseSchema = z.object({
    location: z.string().url(),
    uploadOffset: z.number().min(0),
});

export type TusResponse = z.infer<typeof TusResponseSchema>;