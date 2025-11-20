import { CreateUploadRequest, CreateUploadRequestSchema, TusCreateResponse, TusCreateResponseSchema } from "@/dtos/tus.dto";
import { PhotoRepository } from "@/repositories/photo.repository";
import { savePhotoFile } from "@/utils/fileUtils";
import { rename } from 'fs/promises';
import path from 'path';

class PhotoUploaderService {
    private static instance: PhotoUploaderService;
    private photoRepository: PhotoRepository;

    private constructor() {
        this.photoRepository = PhotoRepository.getInstance();
    }
    
    public static getInstance(): PhotoUploaderService {
        if (!PhotoUploaderService.instance) {
            PhotoUploaderService.instance = new PhotoUploaderService();
        }
        return PhotoUploaderService.instance;
    }

    public async createUploadPhoto(request: CreateUploadRequest): Promise<TusCreateResponse> {
        try {
            // Validate request DTO
            const validatedRequest = CreateUploadRequestSchema.parse(request);
            
            if (validatedRequest.body.byteLength !== validatedRequest.uploadLength) {
                throw new Error('Body length does not match upload-length');
            }
            
            // Extract and sanitize filename from TUS metadata
            const filename = this.extractAndSanitizeFilename(validatedRequest.uploadMetadata, validatedRequest.photoId);
            const fileExtension = this.getFileExtension(filename);
            
            // Use temporary filename during upload
            const tempFilename = `${validatedRequest.photoId}_temp${fileExtension}`;
            const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
            const tempFilePath = path.join(uploadsDir, tempFilename);
            const publicUrl = `/uploads/${tempFilename}`;

            const savedFileSize = await savePhotoFile(validatedRequest.body, tempFilePath);

            // Verify file integrity
            if (savedFileSize !== validatedRequest.uploadLength) {
                throw new Error(`File size mismatch: expected ${validatedRequest.uploadLength}, got ${savedFileSize}`);
            }

            // Check if upload is complete
            const isComplete = savedFileSize === validatedRequest.uploadLength;

            if (isComplete) {
                // Rename to final filename when upload is complete
                const finalFilename = `${filename}`;
                const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
                const finalFilePath = path.join(uploadsDir, finalFilename);
                
                try {
                    await rename(tempFilePath, finalFilePath);
                    console.log(`Upload complete: renamed ${tempFilename} to ${finalFilename}`);
                } catch (renameError) {
                    console.error('Error renaming file:', renameError);
                    // Continue with temp filename if rename fails
                }
            }

            const photoRecord = await this.photoRepository.create({
                id: validatedRequest.photoId,
                url: publicUrl, // Keep original URL (temp filename)
                size: BigInt(validatedRequest.uploadLength),
                offset: BigInt(savedFileSize), 
                filename: filename, // Store original filename for later use
                reportId: undefined
            });

            const response: TusCreateResponse = TusCreateResponseSchema.parse({
                location: `${photoRecord.id}`, 
                uploadOffset: savedFileSize,
            });

            return response;
        } catch (error) {
            console.error('Error in createUploadPhoto:', error);
            throw new Error('Failed to create and save photo');
        }
    }

    /**
     * Extract filename from TUS upload-metadata header and sanitize it
     * TUS metadata format: "filename dGVzdC5qcGc=,filetype aW1hZ2UvanBlZw=="
     */
    private extractAndSanitizeFilename(metadata: string | undefined, fallbackId: string): string {
        if (!metadata) {
            return `photo_${fallbackId.substring(0, 8)}.jpg`;
        }

        try {
            const pairs = metadata.split(',');
            let filename = '';

            for (const pair of pairs) {
                const [key, encodedValue] = pair.trim().split(' ');
                if (key === 'filename' && encodedValue) {
                    filename = Buffer.from(encodedValue, 'base64').toString('utf-8');
                    break;
                }
            }

            if (!filename) {
                return `photo_${fallbackId.substring(0, 8)}.jpg`;
            }

            return this.sanitizeFilename(filename);
        } catch (error) {
            console.warn('Failed to parse TUS metadata:', error);
            return `photo_${fallbackId.substring(0, 8)}.jpg`;
        }
    }

    /**
     * Sanitize filename to prevent path traversal and invalid characters
     */
    private sanitizeFilename(filename: string): string {
        let sanitized = filename
            .replace(/[\/\\]/g, '')
            .replace(/[<>:"|?*\x00-\x1f]/g, '')
            .replace(/^\.+/, '')
            .trim();

        if (!sanitized || sanitized.length === 0) {
            sanitized = 'photo';
        }

        if (sanitized.length > 100) {
            const ext = path.extname(sanitized);
            const name = path.basename(sanitized, ext).substring(0, 96);
            sanitized = name + ext;
        }

        if (!path.extname(sanitized)) {
            sanitized += '.jpg';
        }

        return sanitized;
    }

    /**
     * Get file extension from filename
     */
    private getFileExtension(filename: string): string {
        const ext = path.extname(filename);
        return ext || '.jpg';
    }
}

export { PhotoUploaderService };