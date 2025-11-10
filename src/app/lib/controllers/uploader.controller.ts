import { TusCreateDataSchema, TusUploadDataSchema, TusDeleteDataSchema, TusStatusDataSchema } from '../dtos/tus.header.dto';
import type { TusCreateData, TusUploadData, TusDeleteData, TusStatusData } from '../dtos/tus.header.dto';
import { 
    CreateUploadRequest, 
    UpdatePhotoRequest, 
    GetPhotoStatusRequest, 
    DeletePhotoRequest,
    ControllerSuccessResponse 
} from '@/dtos/tus.dto';
import { PhotoUploaderService } from '@/services/photoUpload.service';
import { PhotoUpdaterService } from '@/services/photoUpdate.service';
import { PhotoDeleteService } from '@/services/photoDelete.service';
import { PhotoStatusService } from '@/services/photoStatus.service';

class UploaderController {

    async createUploadPhoto(data: TusCreateData, bodyBytes: ArrayBuffer): Promise<ControllerSuccessResponse> {
        const validatedData = TusCreateDataSchema.parse(data);

        // Generate photo ID and create service request DTO
        const photoId = crypto.randomUUID();
        const serviceRequest: CreateUploadRequest = {
            uploadLength: validatedData['upload-length'],
            uploadMetadata: validatedData['upload-metadata'],
            body: bodyBytes,
            photoId: photoId
        };

        const uploaderService = PhotoUploaderService.getInstance();
        const result = await uploaderService.createUploadPhoto(serviceRequest);

        return {
            success: true,
            location: result.location,
            uploadOffset: result.uploadOffset,
            tusHeaders: {
                'Tus-Resumable': '1.0.0',
                'Location': result.location,
                'Upload-Offset': result.uploadOffset.toString(),
            }
        };
    }

    async uploadPhotoChunk(uploadId: string, data: TusUploadData, chunkBytes: ArrayBuffer): Promise<ControllerSuccessResponse> {
        const validatedData = TusUploadDataSchema.parse(data);

        if (chunkBytes.byteLength !== validatedData['content-length']) {
            throw new Error('Chunk size does not match content-length');
        }

        // Create service request DTO
        const serviceRequest: UpdatePhotoRequest = {
            photoId: uploadId,
            uploadOffset: validatedData['upload-offset'],
            contentLength: validatedData['content-length'],
            body: chunkBytes
        };

        const uploaderService = PhotoUpdaterService.getInstance();
        const result = await uploaderService.updatePhoto(serviceRequest);

        return {
            success: true,
            uploadOffset: result.uploadOffset,
            tusHeaders: {
                'Tus-Resumable': '1.0.0',
                'Upload-Offset': result.uploadOffset.toString(),
            }
        };
    }

    async getUploadStatus(uploadId: string, data: TusStatusData): Promise<ControllerSuccessResponse> {
        const validatedData = TusStatusDataSchema.parse(data);

        // Create service request DTO
        const serviceRequest: GetPhotoStatusRequest = {
            photoId: uploadId
        };

        const uploaderService = PhotoStatusService.getInstance();
        const uploadInfo = await uploaderService.getPhotoStatus(serviceRequest);
        if (!uploadInfo) {
            throw new Error('Upload not found');
        }

        return {
            success: true,
            uploadOffset: uploadInfo.uploadOffset,
            tusHeaders: {
                'Tus-Resumable': '1.0.0',
                'Upload-Offset': uploadInfo.uploadOffset.toString(),
            }
        };
    }

    async deleteUpload(uploadId: string, data: TusDeleteData): Promise<ControllerSuccessResponse> {
        const validatedData = TusDeleteDataSchema.parse(data);

        // Create service request DTO
        const serviceRequest: DeletePhotoRequest = {
            photoId: uploadId
        };

        const uploaderService = PhotoDeleteService.getInstance();
        const result = await uploaderService.deletePhoto(serviceRequest);

        if (!result.success) {
            throw new Error(result.message || 'Delete operation failed');
        }

        return {
            success: true,
            tusHeaders: {
                'Tus-Resumable': '1.0.0',
            }
        };
    }

    async getTusOptions(): Promise<ControllerSuccessResponse> {
        return {
            success: true,
            tusHeaders: {
                'Tus-Resumable': '1.0.0',
                'Tus-Version': '1.0.0',
                'Tus-Extension': 'creation,creation-with-upload,termination',
                'Tus-Max-Size': (20 * 1024 * 1024).toString(),
            }
        };
    }
}

export { UploaderController };