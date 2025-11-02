import { TusCreateHeaders } from "@/dtos/tus.header.dto";
import { TusCreateResponse } from "@/dtos/tus.response.dto";
import { PhotoRepository } from "@/repositories/photoRepository";
import {savePhotoFile} from "@/utils/fileUtils";
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
            const filePath = path.join(process.cwd(), 'uploads', photoId);
            const publicUrl = `/uploads/${photoId}`;


            const savedFileSize = await savePhotoFile(body, filePath);

            if (savedFileSize === headers['upload-length']) {
                
            }

            const photoRecord = await this.photoRepository.create({
                id: photoId,
                url: publicUrl,
                reportId: undefined
            });

            // 4. Costruisci risposta TUS
            const response: TusCreateResponse = {
                location: `${photoRecord.id}`,
                uploadOffset: savedFileSize,
            };

            return response;
        } catch (error) {
            console.error('Error in createUploadPhotoUrl:', error);
            throw new Error('Failed to create and save photo');
        }
    }
}

export { PhotoUploaderService as PhotoUploaderService };