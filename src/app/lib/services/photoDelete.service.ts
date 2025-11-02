import { PhotoRepository } from '@/repositories/photo.repository';
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

    public async deletePhoto(photoId: string): Promise<void> {
        try {
            // Get photo record from database
            const photo = await this.photoRepository.findById(photoId);
            if (!photo) {
                throw new Error(`Photo with ID ${photoId} not found`);
            }

            // Determine filename based on upload completion status
            let filename: string;
            const isComplete = photo.offset === photo.size;

            if (isComplete) {
                // Upload is complete - use final filename format: {id}_{originalFilename}
                filename = `${photo.filename}`;
            } else {
                // Upload is incomplete - use temporary filename format: {id}_temp.{ext}
                const extension = path.extname(photo.filename) || '.jpg';
                filename = `${photoId}_temp${extension}`;
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
            await this.photoRepository.delete(photoId);
            console.log(`Photo record deleted from database: ${photoId}`);

        } catch (error) {
            console.error('Error in deletePhoto:', error);
            throw new Error(`Failed to delete photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

export { PhotoDeleteService };
