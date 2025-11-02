import { TusUploadHeaders } from "@/dtos/tus.header.dto";
import { TusUpdateResponse } from "@/dtos/tus.response.dto";
import { PhotoRepository } from "@/repositories/photoRepository";
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

    public async updatePhoto(uploadId: string, headers: TusUploadHeaders, body: ArrayBuffer): Promise<TusUpdateResponse> {
        if (body.byteLength !== headers['content-length']) {
            throw new Error('Body length does not match content-length header');
        }

        try {
            // Get current photo record
            const currentPhoto = await this.photoRepository.findById(uploadId);
            if (!currentPhoto) {
                throw new Error('Photo not found');
            }

            // Verify upload-offset matches current stored offset
            if (headers['upload-offset'] !== Number(currentPhoto.offset)) {
                throw new Error(`Offset mismatch: expected ${currentPhoto.offset}, got ${headers['upload-offset']}`);
            }

            // Get current filename from URL (temp filename)
            const currentFilename = path.basename(currentPhoto.url);
            const filePath = path.join(process.cwd(), 'uploads', currentFilename);

            // Append chunk to existing file
            const buffer = Buffer.from(body);
            await appendFile(filePath, buffer);

            // Calculate new offset
            const newOffset = headers['upload-offset'] + body.byteLength;

            // Update photo record with new offset
            const photoRecord = await this.photoRepository.update(uploadId, {
                offset: BigInt(newOffset), 
            });

            // Check if upload is complete
            const isComplete = photoRecord.offset === photoRecord.size;

            if (isComplete) {
                console.log(`Upload complete for photo ID: ${uploadId}`);
                
                // Rename from temporary to final filename
                const finalFilename = `${uploadId}_${currentPhoto.filename}`;
                const finalFilePath = path.join(process.cwd(), 'uploads', finalFilename);
                
                try {
                    await rename(filePath, finalFilePath);
                    console.log(`File renamed from ${currentFilename} to ${finalFilename}`);
                } catch (renameError) {
                    console.error('Error renaming completed file:', renameError);
                    // Continue even if rename fails
                }
            }

            const response: TusUpdateResponse = {
                uploadOffset: Number(photoRecord.offset)
            };

            return response;
        } catch (error) {
            console.error('Error in updatePhoto:', error);
            throw new Error('Failed to update photo');
        }
    }
}

export { PhotoUpdaterService };