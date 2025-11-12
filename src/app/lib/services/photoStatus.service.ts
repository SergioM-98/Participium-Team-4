import { PhotoRepository } from '@/repositories/photo.repository';
import { GetPhotoStatusRequest, GetPhotoStatusRequestSchema, TusStatusResponse, TusStatusResponseSchema } from '@/dtos/tus.dto';

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
    public async getPhotoStatus(request: GetPhotoStatusRequest): Promise<TusStatusResponse | null> {
        try {
            // Validate request DTO
            const validatedRequest = GetPhotoStatusRequestSchema.parse(request);
            
            const photo = await this.photoRepository.findById(validatedRequest.photoId);
            if (!photo) return null;

            const response: TusStatusResponse = TusStatusResponseSchema.parse({
                uploadOffset: Number(photo.offset),
            });

            return response;
        } catch (error) {
            console.error('Error in getPhotoStatus:', error);
            throw new Error('Failed to get photo status');
        }
    }
}

export { PhotoStatusService };