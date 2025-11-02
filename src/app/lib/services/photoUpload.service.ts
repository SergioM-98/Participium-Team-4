import { TusCreateHeaders } from "@/dtos/tus.header.dto";
import { TusCreateResponse } from "@/app/lib/dtos/tus.dto";
import { PhotoRepository } from "@/app/lib/repositories/photo.repository";
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

    public async createUploadPhoto(headers: TusCreateHeaders, body: ArrayBuffer): Promise<TusCreateResponse> {
        if (body.byteLength !== headers['upload-length']) {
            throw new Error('Body length does not match upload-length header');
        }

        try {
            const photoId = crypto.randomUUID();
            
            // Extract and sanitize filename from TUS metadata
            const filename = this.extractAndSanitizeFilename(headers['upload-metadata'], photoId);
            const fileExtension = this.getFileExtension(filename);
            
            // Use temporary filename during upload
            const tempFilename = `${photoId}_temp${fileExtension}`;
            const tempFilePath = path.join(process.cwd(), 'uploads', tempFilename);
            const publicUrl = `/uploads/${tempFilename}`;

            const savedFileSize = await savePhotoFile(body, tempFilePath);

            // Verify file integrity
            if (savedFileSize !== headers['upload-length']) {
                throw new Error(`File size mismatch: expected ${headers['upload-length']}, got ${savedFileSize}`);
            }

            // Check if upload is complete
            const isComplete = savedFileSize === headers['upload-length'];

            if (isComplete) {
                // Rename to final filename when upload is complete
                const finalFilename = `${photoId}_${filename}`;
                const finalFilePath = path.join(process.cwd(), 'uploads', finalFilename);
                
                try {
                    await rename(tempFilePath, finalFilePath);
                    console.log(`Upload complete: renamed ${tempFilename} to ${finalFilename}`);
                } catch (renameError) {
                    console.error('Error renaming file:', renameError);
                    // Continue with temp filename if rename fails
                }
            }

            const photoRecord = await this.photoRepository.create({
                id: photoId,
                url: publicUrl, // Keep original URL (temp filename)
                size: BigInt(headers['upload-length']),
                offset: BigInt(savedFileSize), 
                filename: filename, // Store original filename for later use
                reportId: undefined
            });

            const response: TusCreateResponse = {
                location: `/api/photos/${photoRecord.id}`, 
                uploadOffset: savedFileSize,
            };

            return response;
        } catch (error) {
            console.error('Error in createUploadPhotoUrl:', error);
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