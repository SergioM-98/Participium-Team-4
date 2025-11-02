import { TusCreateHeaders } from "@/dtos/tus.header.dto";
import { TusUpdateResponse } from "@/dtos/tus.response.dto";
import { PhotoRepository } from "@/repositories/photoRepository";
import {savePhotoFile} from "@/utils/fileUtils";
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

    public async updatePhoto(headers: TusCreateHeaders, body: ArrayBuffer): Promise<TusCreateResponse> {
        if (body.byteLength !== headers['upload-length']) {
            throw new Error('Body length does not match upload-length header');
        }

        try {
            const photoId = headers['upload-metadata']?.split(' ')[1];
            if (!photoId) {
                throw new Error('Missing photo ID in upload-metadata header');
            }

            const fileName = `${photoId}.jpg`;
            const filePath = path.join(process.cwd(), 'uploads', fileName);
            const publicUrl = `/uploads/${fileName}`;

            await savePhotoFile(body, filePath);

            const photoRecord = await this.photoRepository.update(photoId, {
                url: publicUrl,
                reportId: undefined
            });

            const response: TusUpdateResponse = {
                uploadOffset: body.byteLength,
            };

            return response;
        } catch (error) {
            console.error('Error in updatePhoto:', error);
            throw new Error('Failed to update photo');
        }
    }
}

export { PhotoUpdaterService as PhotoUpdaterService };