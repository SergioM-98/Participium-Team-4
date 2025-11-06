import { PhotoRepository } from '@/repositories/photo.repository';
import { TusStatusResponse } from '@/dtos/tus.response.dto';

class PhotoStatusService {
    private static instance: PhotoStatusService
    private photoRepository: PhotoRepository;

    private constructor() {
        this.photoRepository = PhotoRepository.getInstance();
    }
    public static getInstance(): PhotoStatusService {
        if (!PhotoStatusService.instance) {
            PhotoStatusService.instance = new PhotoStatusService();
        }
        return PhotoStatusService.instance;
    }
    public async getPhotoStatus(photoId: string): Promise<TusStatusResponse | null> {
        const photo = await this.photoRepository.findById(photoId);
        if (!photo) return null;

        return {
            uploadOffset: photo.uploadOffset,
        };
    }
}

export { PhotoStatusService };