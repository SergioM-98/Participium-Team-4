'use server'

import { TusCreateDataSchema, TusUploadDataSchema, TusDeleteDataSchema, TusStatusDataSchema } from '../dtos/tus.header.dto';
import { PhotoUploaderService } from '../services/photoUpload.service';
import { PhotoUpdaterService } from '../services/photoUpdate.service';
import { PhotoDeleteService } from '../services/photoDelete.service';
import { PhotoStatusService } from '../services/photoStatus.service';

export async function createUploadPhoto(formData: FormData) {
    try {
        const tusResumable = formData.get('tus-resumable') as string;
        const uploadLength = formData.get('upload-length') as string;
        const uploadMetadata = formData.get('upload-metadata') as string | null;
        const file = formData.get('file') as File | null;

        const dataObj = {
            'tus-resumable': tusResumable,
            'upload-length': uploadLength,
            'upload-metadata': uploadMetadata || undefined,
            'content-length': file ? file.size.toString() : '0',
        };
        
        const validatedData = TusCreateDataSchema.parse(dataObj);
        
        // Convert file to ArrayBuffer if present
        const bodyBytes = file ? await file.arrayBuffer() : new ArrayBuffer(0);

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

export async function uploadPhotoChunk(uploadId: string, formData: FormData) {
    try {
        const tusResumable = formData.get('tus-resumable') as string;
        const uploadOffset = formData.get('upload-offset') as string;
        const contentType = formData.get('content-type') as string;
        const chunk = formData.get('chunk') as File | null;

        if (!chunk) {
            throw new Error('No chunk data provided');
        }

        const dataObj = {
            'tus-resumable': tusResumable,
            'upload-offset': uploadOffset,
            'content-type': contentType,
            'content-length': chunk.size.toString(),
        };

        const validatedData = TusUploadDataSchema.parse(dataObj);
        
        const chunkBytes = await chunk.arrayBuffer();

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

export async function getUploadStatus(uploadId: string, tusResumable: string = '1.0.0') {
    try {
        const dataObj = {
            'tus-resumable': tusResumable,
        };

        const validatedData = TusStatusDataSchema.parse(dataObj);

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

export async function deleteUpload(uploadId: string, tusResumable: string = '1.0.0') {
    try {
        const dataObj = {
            'tus-resumable': tusResumable,
        };

        const validatedData = TusDeleteDataSchema.parse(dataObj);

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

export async function getTusOptions() {
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

