import { TusCreateDataSchema, TusUploadDataSchema, TusDeleteDataSchema, TusStatusDataSchema } from '../dtos/tus.header.dto';
import type { TusCreateData, TusUploadData, TusDeleteData, TusStatusData } from '../dtos/tus.header.dto';
import { PhotoUploaderService } from '@/services/photoUpload.service';
import { PhotoUpdaterService } from '@/services/photoUpdate.service';
import { PhotoDeleteService } from '@/services/photoDelete.service';
import { PhotoStatusService } from '@/services/photoStatus.service';

class UploaderController {

    async createUploadPhoto(data: TusCreateData, bodyBytes: ArrayBuffer) {
        try {
            const validatedData = TusCreateDataSchema.parse(data);

            const uploaderService = PhotoUploaderService.getInstance();
            const result = await uploaderService.createUploadPhoto(validatedData, bodyBytes);

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

        } catch (error) {
            console.error('Error creating upload photo:', error);

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upload creation failed',
                tusHeaders: {
                    'Tus-Resumable': '1.0.0',
                }
            };
        }
    }

    async uploadPhotoChunk(uploadId: string, data: TusUploadData, chunkBytes: ArrayBuffer) {
        try {
            const validatedData = TusUploadDataSchema.parse(data);

            if (chunkBytes.byteLength !== validatedData['content-length']) {
                throw new Error('Chunk size does not match content-length');
            }

            const uploaderService = PhotoUpdaterService.getInstance();
            const result = await uploaderService.updatePhoto(uploadId, validatedData, chunkBytes);

            return {
                success: true,
                uploadOffset: result.uploadOffset,
                tusHeaders: {
                    'Tus-Resumable': '1.0.0',
                    'Upload-Offset': result.uploadOffset.toString(),
                }
            };

        } catch (error) {
            console.error('Error uploading photo chunk:', error);

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Chunk upload failed',
                tusHeaders: {
                    'Tus-Resumable': '1.0.0',
                }
            };
        }
    }

    async getUploadStatus(uploadId: string, data: TusStatusData) {
        try {
            const validatedData = TusStatusDataSchema.parse(data);

            const uploaderService = PhotoStatusService.getInstance();
            const uploadInfo = await uploaderService.getPhotoStatus(uploadId);
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

        } catch (error) {
            console.error('Error getting upload status:', error);

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upload not found',
                tusHeaders: {
                    'Tus-Resumable': '1.0.0',
                }
            };
        }
    }

    async deleteUpload(uploadId: string, data: TusDeleteData) {
        try {
            const validatedData = TusDeleteDataSchema.parse(data);

            const uploaderService = PhotoDeleteService.getInstance();
            await uploaderService.deletePhoto(uploadId);

            return {
                success: true,
                tusHeaders: {
                    'Tus-Resumable': '1.0.0',
                }
            };

        } catch (error) {
            console.error('Error deleting upload:', error);

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upload deletion failed',
                tusHeaders: {
                    'Tus-Resumable': '1.0.0',
                }
            };
        }
    }

    async getTusOptions() {
        try {
            return {
                success: true,
                tusHeaders: {
                    'Tus-Resumable': '1.0.0',
                    'Tus-Version': '1.0.0',
                    'Tus-Extension': 'creation,creation-with-upload,termination',
                    'Tus-Max-Size': (20 * 1024 * 1024).toString(),
                }
            };

        } catch (error) {
            console.error('Error getting TUS options:', error);

            return {
                success: false,
                error: 'Failed to get TUS options',
                tusHeaders: {
                    'Tus-Resumable': '1.0.0',
                }
            };
        }
    }
}

export { UploaderController };