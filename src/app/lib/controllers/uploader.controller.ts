'use server'

import { headers } from 'next/headers';
import { TusCreateHeadersSchema, TusUploadHeadersSchema, TusDeleteHeadersSchema } from '@/dtos/tus.header.dto';
import { PhotoUploaderService } from '@/services/photoUpload.service';
import { PhotoUpdaterService } from '@/services/photoUpdate.service';
import { PhotoDeleteService } from '@/services/photoDelete.service';

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
        
        // Return TUS compliant response for upload creation
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

        // Extract TUS headers for chunk upload (PATCH)
        const headersObj = {
            'tus-resumable': headersList.get('tus-resumable'),
            'upload-offset': headersList.get('upload-offset'),
            'content-type': headersList.get('content-type'),
            'content-length': headersList.get('content-length'),
        };

        // Validate TUS headers for PATCH request
        const validatedHeaders = TusUploadHeadersSchema.parse(headersObj);
        
        // Get chunk data from request body
        const chunkBytes = await request.arrayBuffer();

        // Validate chunk size matches content-length header
        if (chunkBytes.byteLength !== validatedHeaders['content-length']) {
            throw new Error('Chunk size does not match content-length header');
        }

        const uploaderService = PhotoUpdaterService.getInstance();
        const result = await uploaderService.updatePhoto(uploadId, validatedHeaders, chunkBytes);

        // Return appropriate TUS response based on completion status

            return {
                uploadOffset: result.uploadOffset,
                tusHeaders: {
                    'Tus-Resumable': '1.0.0',
                    'Upload-Offset': result.uploadOffset.toString(),
                }
            };

        

    } catch (error) {
        console.error('Error uploading photo chunk:', error);
        
        // Return TUS-compliant error response
        return {

            error: error instanceof Error ? error.message : 'Chunk upload failed',
            tusHeaders: {
                'Tus-Resumable': '1.0.0',
            }
        };
    }
}



export async function deleteUpload(uploadId: string) {
    try {
        const headersList = await headers();

        // Extract and validate TUS headers for DELETE request
        const headersObj = {
            'tus-resumable': headersList.get('tus-resumable'),
        };

        const validatedHeaders = TusDeleteHeadersSchema.parse(headersObj);

        const uploaderService = PhotoDeleteService.getInstance();
        const result = await uploaderService.deletePhoto(uploadId);

        // Return successful deletion response
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

