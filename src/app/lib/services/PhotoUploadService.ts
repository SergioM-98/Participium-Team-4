import { TusCreateHeaders } from "@/dtos/tus.header.dto";
import { TusResponse } from "@/dtos/tus.response.dto";
import { PhotoRepository } from "@/repositories/photoRepository";
import { writeFile } from 'fs/promises';
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

    public async createUploadPhotoUrl(headers: TusCreateHeaders, body: ArrayBuffer): Promise<TusResponse> {
        if (body.byteLength !== headers['upload-length']) {
            throw new Error('Body length does not match upload-length header');
        }

        try {
            
            const photoId = crypto.randomUUID();
            const fileName = `${photoId}.jpg`; 
            const filePath = path.join(process.cwd(), 'uploads', fileName);
            const publicUrl = `/uploads/${fileName}`;


            await this.savePhotoFile(body, filePath);


            const photoRecord = await this.photoRepository.create({
                id: photoId,
                url: publicUrl,
                reportId: undefined
            });

            // 4. Costruisci risposta TUS
            const response: TusResponse = {
                location: `${photoRecord.id}`,
                uploadOffset: body.byteLength, 
            };

            return response;
        } catch (error) {
            console.error('Error in createUploadPhotoUrl:', error);
            throw new Error('Failed to create and save photo');
        }
    }

    private async savePhotoFile(body: ArrayBuffer, filePath: string): Promise<void> {
        try {

            const dir = path.dirname(filePath);
            await writeFile(dir, '', { flag: 'a' }).catch(() => {}); 
            

            const buffer = Buffer.from(body);
            await writeFile(filePath, buffer);
            
            console.log(`Photo saved to: ${filePath}`);
        } catch (error) {
            console.error('Error saving photo file:', error);
            throw new Error('Failed to save photo file');
        }
    }
}

export { PhotoUploaderService as UploaderCreateService };