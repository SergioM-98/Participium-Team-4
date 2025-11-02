import { z } from "zod";

export const TusCreateResponseSchema = z.object({
    location: z.string().url(),
    uploadOffset: z.number().min(0),
});

export const TusUploadResponseSchema = z.object({
    uploadOffset: z.number().min(0),
});

export const TusStatusResponseSchema = z.object({
    uploadOffset: z.number().min(0),
});

export type TusCreateResponse = z.infer<typeof TusCreateResponseSchema>;
export type TusUpdateResponse = z.infer<typeof TusUploadResponseSchema>;
export type TusStatusResponse = z.infer<typeof TusStatusResponseSchema>;