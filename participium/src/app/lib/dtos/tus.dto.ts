import { z } from "zod";

// Request DTOs for services
export const CreateUploadRequestSchema = z.object({
    uploadLength: z.number().min(1).max(50 * 1024 * 1024), // 50MB max
    uploadMetadata: z.string().optional(),
    body: z.instanceof(ArrayBuffer),
    photoId: z.string().uuid()
});

export const UpdatePhotoRequestSchema = z.object({
    photoId: z.string().uuid(),
    uploadOffset: z.number().min(0),
    contentLength: z.number().min(1),
    body: z.instanceof(ArrayBuffer)
});

export const GetPhotoStatusRequestSchema = z.object({
    photoId: z.string().uuid()
});

export const DeletePhotoRequestSchema = z.object({
    photoId: z.string().uuid()
});

// Response DTOs for services
export const TusCreateResponseSchema = z.object({
    location: z.string(),
    uploadOffset: z.number().min(0),
});

export const TusUploadResponseSchema = z.object({
    uploadOffset: z.number().min(0),
});

export const TusStatusResponseSchema = z.object({
    uploadOffset: z.number().min(0),
});

export const TusDeleteResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().optional()
});


export type ControllerSuccessResponse = {
    success: true;
    tusHeaders: Record<string, string>;
    location?: string;
    uploadOffset?: number;
} | {
    success: false;
    error: string;
    tusHeaders: Record<string, string>;
};

// Type exports
export type CreateUploadRequest = z.infer<typeof CreateUploadRequestSchema>;
export type UpdatePhotoRequest = z.infer<typeof UpdatePhotoRequestSchema>;
export type GetPhotoStatusRequest = z.infer<typeof GetPhotoStatusRequestSchema>;
export type DeletePhotoRequest = z.infer<typeof DeletePhotoRequestSchema>;

export type TusCreateResponse = z.infer<typeof TusCreateResponseSchema>;
export type TusUpdateResponse = z.infer<typeof TusUploadResponseSchema>;
export type TusStatusResponse = z.infer<typeof TusStatusResponseSchema>;
export type TusDeleteResponse = z.infer<typeof TusDeleteResponseSchema>;