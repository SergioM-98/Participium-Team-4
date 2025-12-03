import { CreateUploadRequest, CreateUploadRequestSchema, TusCreateResponse, TusCreateResponseSchema } from "@/dtos/tus.dto";
import { PhotoRepository } from "@/repositories/photo.repository";
import { savePhotoFile } from "@/utils/fileUtils";
import { renameSync, existsSync } from 'node:fs';
import path from 'node:path';

class PhotoUploaderService {
    private static instance: PhotoUploaderService;
    private readonly photoRepository: PhotoRepository;

    private constructor() {
        this.photoRepository = PhotoRepository.getInstance();
    }
    
    public static getInstance(): PhotoUploaderService {
        if (!PhotoUploaderService.instance) {
            PhotoUploaderService.instance = new PhotoUploaderService();
        }
        return PhotoUploaderService.instance;
    }

    private getUniqueFilename(dir: string, originalFilename: string): string {
        const ext = path.extname(originalFilename);
        const name = path.basename(originalFilename, ext);
        let candidate = originalFilename;
        let counter = 1;

        while (existsSync(path.join(dir, candidate))) {
            candidate = `${name}(${counter})${ext}`;
            counter++;
        }

        return candidate;
    }

    public async createUploadPhoto(request: CreateUploadRequest): Promise<TusCreateResponse> {
        
            const validatedRequest = CreateUploadRequestSchema.parse(request);
            
            if (validatedRequest.body.byteLength !== validatedRequest.uploadLength) {
                throw new Error('Body length does not match upload-length');
            }
            

            let filename = this.extractAndSanitizeFilename(validatedRequest.uploadMetadata, validatedRequest.photoId);
            const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');

            filename = this.getUniqueFilename(uploadsDir, filename);

            const fileExtension = this.getFileExtension(filename);
            const tempFilename = `${validatedRequest.photoId}_temp${fileExtension}`;
            const tempFilePath = path.join(uploadsDir, tempFilename);
            

            let publicUrl = `/uploads/${tempFilename}`;

            const savedFileSize = await savePhotoFile(validatedRequest.body, tempFilePath);

            if (savedFileSize !== validatedRequest.uploadLength) {
                throw new Error(`File size mismatch: expected ${validatedRequest.uploadLength}, got ${savedFileSize}`);
            }

            const isComplete = savedFileSize === validatedRequest.uploadLength;


            if (isComplete) {
                const finalFilePath = path.join(uploadsDir, filename);
                try {
                    renameSync(tempFilePath, finalFilePath);
                    console.log(`Upload complete: renamed ${tempFilename} to ${filename}`);
 
                    publicUrl = `/uploads/${filename}`;
                } catch (renameError) {
                    console.error('Error renaming file:', renameError);
                }
            }

            const photoRecord = await this.photoRepository.create({
                id: validatedRequest.photoId,
                url: publicUrl, 
                size: BigInt(validatedRequest.uploadLength),
                offset: BigInt(savedFileSize), 
                filename: filename, 
                reportId: undefined
            });

            return TusCreateResponseSchema.parse({
                location: `${photoRecord.id}`, 
                uploadOffset: savedFileSize,
            });
        } 
    


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
            if (!filename) return `photo_${fallbackId.substring(0, 8)}.jpg`;
            return this.sanitizeFilename(filename);
        } catch (error) {
            console.warn('Failed to parse TUS metadata:', error);
            return `photo_${fallbackId.substring(0, 8)}.jpg`;
        }
    }

    private sanitizeFilename(filename: string): string {
        let sanitized = filename
            .replaceAll(/[\/\\]/g, '')
            .replaceAll(/[<>:"|?*\x00-\x1f]/g, '')
            .replace(/^\.+/, '')
            .trim();
        if (!sanitized || sanitized.length === 0) sanitized = 'photo';
        if (sanitized.length > 100) {
            const ext = path.extname(sanitized);
            const name = path.basename(sanitized, ext).substring(0, 96);
            sanitized = name + ext;
        }
        if (!path.extname(sanitized)) sanitized += '.jpg';
        return sanitized;
    }

    private getFileExtension(filename: string): string {
        const ext = path.extname(filename);
        return ext || '.jpg';
    }
}

export { PhotoUploaderService };