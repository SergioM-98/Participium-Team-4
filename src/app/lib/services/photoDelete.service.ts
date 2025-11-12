import { PhotoRepository } from '@/repositories/photo.repository';
import { DeletePhotoRequest, DeletePhotoRequestSchema, TusDeleteResponse, TusDeleteResponseSchema } from '@/dtos/tus.dto';
import { unlink } from 'fs/promises';
import path from 'path';

class PhotoDeleteService {
    private static instance: PhotoDeleteService;
    private photoRepository: PhotoRepository;

    private constructor() {
        this.photoRepository = PhotoRepository.getInstance();
    }

    public static getInstance(): PhotoDeleteService {
        if (!PhotoDeleteService.instance) {
            PhotoDeleteService.instance = new PhotoDeleteService();
        }
        return PhotoDeleteService.instance;
    }

    public async deletePhoto(request: DeletePhotoRequest): Promise<TusDeleteResponse> {
        try {
            // Validate request DTO
            const validatedRequest = DeletePhotoRequestSchema.parse(request);
            
            // Get photo record from database
            const photo = await this.photoRepository.findById(validatedRequest.photoId);
            if (!photo) {
                throw new Error(`Photo with ID ${validatedRequest.photoId} not found`);
            }

            // Determine filename based on upload completion status
            let filename: string;
            const isComplete = photo.offset === photo.size;

            if (isComplete) {
                // Upload is complete - use final filename format: {id}_{originalFilename}
                filename = `${photo.filename}`;
            } else {
                // Upload is incomplete - use temporary filename format: {id}_temp.{ext}
                const extension = path.extname(photo.filename || '') || '.jpg';
                filename = `${validatedRequest.photoId}_temp${extension}`;
            }

            // Construct full file path
            const filePath = path.join(process.cwd(), 'uploads', filename);

            try {
                // Delete file from filesystem
                await unlink(filePath);
                console.log(`File deleted: ${filePath}`);
            } catch (fileError) {
                // Log file deletion error but continue with database deletion
                console.warn(`Failed to delete file ${filePath}:`, fileError);
            }

            // Delete photo record from database
            await this.photoRepository.delete(validatedRequest.photoId);
            console.log(`Photo record deleted from database: ${validatedRequest.photoId}`);

            const response: TusDeleteResponse = TusDeleteResponseSchema.parse({
                success: true,
                message: 'Photo deleted successfully'
            });

            return response;
        } catch (error) {
            console.error('Error in deletePhoto:', error);
            
            const response: TusDeleteResponse = TusDeleteResponseSchema.parse({
                success: false,
                message: `Failed to delete photo: ${error instanceof Error ? error.message : 'Unknown error'}`
            });

            return response;
        }
    }
}

export { PhotoDeleteService };
