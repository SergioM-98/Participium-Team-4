import { UpdatePhotoRequest, UpdatePhotoRequestSchema, TusUpdateResponse, TusUploadResponseSchema } from "@/dtos/tus.dto";
import { PhotoRepository } from "@/repositories/photo.repository";
import { appendFile, rename } from 'fs/promises';
import path from 'path';

class PhotoUpdaterService {
    private static instance: PhotoUpdaterService;
    private photoRepository: PhotoRepository;

    private constructor() {
        this.photoRepository = PhotoRepository.getInstance();
    }

    public static getInstance(): PhotoUpdaterService {
        if (!PhotoUpdaterService.instance) {
            PhotoUpdaterService.instance = new PhotoUpdaterService();
        }
        return PhotoUpdaterService.instance;
    }

    public async updatePhoto(request: UpdatePhotoRequest): Promise<TusUpdateResponse> {
        try {
            // Validate request DTO
            const validatedRequest = UpdatePhotoRequestSchema.parse(request);
            
            if (validatedRequest.body.byteLength !== validatedRequest.contentLength) {
                throw new Error('Body length does not match content-length');
            }

            // Get current photo record
            const currentPhoto = await this.photoRepository.findById(validatedRequest.photoId);
            if (!currentPhoto) {
                throw new Error('Photo not found');
            }

            // Verify upload-offset matches current stored offset
            if (validatedRequest.uploadOffset !== Number(currentPhoto.offset)) {
                throw new Error(`Offset mismatch: expected ${currentPhoto.offset}, got ${validatedRequest.uploadOffset}`);
            }

            // Get current filename from URL (temp filename)
            const currentFilename = path.basename(currentPhoto.url);
            const filePath = path.join(process.cwd(), 'uploads', currentFilename);

            // Append chunk to existing file
            const buffer = Buffer.from(validatedRequest.body);
            await appendFile(filePath, buffer);

            // Calculate new offset
            const newOffset = validatedRequest.uploadOffset + validatedRequest.body.byteLength;

            // Update photo record with new offset
            const photoRecord = await this.photoRepository.update(validatedRequest.photoId, {
                offset: BigInt(newOffset), 
            });

            // Check if upload is complete
            const isComplete = photoRecord.offset === photoRecord.size;

            if (isComplete) {
                console.log(`Upload complete for photo ID: ${validatedRequest.photoId}`);
                
                // Rename from temporary to final filename
                const finalFilename = `${currentPhoto.filename}`;
                const finalFilePath = path.join(process.cwd(), 'uploads', finalFilename);
                
                try {
                    await rename(filePath, finalFilePath);
                    console.log(`File renamed from ${currentFilename} to ${finalFilename}`);
                } catch (renameError) {
                    console.error('Error renaming completed file:', renameError);
                    // Continue even if rename fails
                }
            }

            const response: TusUpdateResponse = TusUploadResponseSchema.parse({
                uploadOffset: Number(photoRecord.offset)
            });

            return response;
        } catch (error) {
            console.error('Error in updatePhoto:', error);
            throw new Error('Failed to update photo');
        }
    }
}

export { PhotoUpdaterService };