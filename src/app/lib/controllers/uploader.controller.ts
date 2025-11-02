'use server'

import { headers } from 'next/headers';
import { TusCreateHeadersSchema, TusUploadHeadersSchema, TusDeleteHeadersSchema, TusStatusHeadersSchema } from '@/dtos/tus.header.dto';
import { PhotoUploaderService } from '@/services/photoUpload.service';
import { PhotoUpdaterService } from '@/services/photoUpdate.service';
import { PhotoDeleteService } from '@/services/photoDelete.service';
import { PhotoStatusService } from '@/services/photoStatus.service';

export async function createUploadPhoto(request: Request) {
    try {
        const headersList = await headers();

        const headersObj = {
            'tus-resumable': headersList.get('tus-resumable'),
            'upload-length': headersList.get('upload-length'),
            'upload-metadata': headersList.get('upload-metadata'),
            'content-length': headersList.get('content-length'),
        };    
        
        const validatedHeaders = TusCreateHeadersSchema.parse(headersObj);
        const bodyBytes = await request.arrayBuffer();

        const uploaderService = PhotoUploaderService.getInstance();
        const result = await uploaderService.createUploadPhoto(validatedHeaders, bodyBytes);
        
        return {
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
            error: error instanceof Error ? error.message : 'Upload creation failed',
            tusHeaders: {
                'Tus-Resumable': '1.0.0',
            }
        };
    }
}

export async function uploadPhotoChunk(request: Request, uploadId: string) {
    try {
        const headersList = await headers();

        const headersObj = {
            'tus-resumable': headersList.get('tus-resumable'),
            'upload-offset': headersList.get('upload-offset'),
            'content-type': headersList.get('content-type'),
            'content-length': headersList.get('content-length'),
        };

        const validatedHeaders = TusUploadHeadersSchema.parse(headersObj);
        
        const chunkBytes = await request.arrayBuffer();

        if (chunkBytes.byteLength !== validatedHeaders['content-length']) {
            throw new Error('Chunk size does not match content-length header');
        }

        const uploaderService = PhotoUpdaterService.getInstance();
        const result = await uploaderService.updatePhoto(uploadId, validatedHeaders, chunkBytes);

        return {
            uploadOffset: result.uploadOffset,
            tusHeaders: {
                'Tus-Resumable': '1.0.0',
                'Upload-Offset': result.uploadOffset.toString(),
            }
        };

    } catch (error) {
        console.error('Error uploading photo chunk:', error);
        
        return {
            error: error instanceof Error ? error.message : 'Chunk upload failed',
            tusHeaders: {
                'Tus-Resumable': '1.0.0',
            }
        };
    }
}

export async function getUploadStatus(uploadId: string) {
    try {
        const headersList = await headers();

        const headersObj = {
            'tus-resumable': headersList.get('tus-resumable'),
        };

        const validatedHeaders = TusStatusHeadersSchema.parse(headersObj);

        const uploaderService = PhotoStatusService.getInstance();
        const uploadInfo = await uploaderService.getPhotoStatus(uploadId);
        if (!uploadInfo) {
            throw new Error('Upload not found');
        }

        return {
            uploadOffset: uploadInfo.uploadOffset,
            tusHeaders: {
                'Tus-Resumable': '1.0.0',
                'Upload-Offset': uploadInfo.uploadOffset.toString(),
            }
        };

    } catch (error) {
        console.error('Error getting upload status:', error);
        
        return {
            error: error instanceof Error ? error.message : 'Upload not found',
            tusHeaders: {
                'Tus-Resumable': '1.0.0',
            }
        };
    }
}

export async function deleteUpload(uploadId: string) {
    try {
        const headersList = await headers();

        const headersObj = {
            'tus-resumable': headersList.get('tus-resumable'),
        };

        const validatedHeaders = TusDeleteHeadersSchema.parse(headersObj);

        const uploaderService = PhotoDeleteService.getInstance();
        await uploaderService.deletePhoto(uploadId);

        return {
            tusHeaders: {
                'Tus-Resumable': '1.0.0',
            }
        };

    } catch (error) {
        console.error('Error deleting upload:', error);
        
        return {
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
            error: 'Failed to get TUS options',
            tusHeaders: {
                'Tus-Resumable': '1.0.0',
            }
        };
    }
}

