'use server'

import {headers} from 'next/headers';
import {TusCreateHeadersSchema, TusUploadHeadersSchema} from '@/dtos/tus.header.dto';
import { PhotoUploaderService } from '@/app/lib/services/PhotoUploadService';


export async function createUploadPhoto(Request: Request) {
    
    try {
    const headersList = await headers();

    const headersObj = {
      'tus-resumable': headersList.get('tus-resumable'),
      'upload-length': headersList.get('upload-length'),
      'upload-metadata': headersList.get('upload-metadata'),
      'content-length': headersList.get('content-length'),
    };    
    const validatedHeaders = TusCreateHeadersSchema.parse(headersObj);

    const bodyBytes = await Request.arrayBuffer();

    const uploaderCreateService = PhotoUploaderService.getInstance();
    const result = await uploaderCreateService.createUploadPhoto(validatedHeaders, bodyBytes);
        return new Response(null, {
            status: 201, // Created ì
            headers: {
                'Tus-Resumable': '1.0.0',
                'Location': result.location,
                'Upload-Offset': result.uploadOffset.toString(),
            }
        });
        
    } catch (error) {
        console.error('Error creating upload photo URL:', error);
        throw error;
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

        const uploaderService = PhotoUploaderService.getInstance();
        const result = await uploaderService.uploadPhotoChunk(uploadId, validatedHeaders, chunkBytes);

        // Return appropriate TUS response based on completion status
        if (result.complete) {
            // Upload completed successfully
            return new Response(null, {
                status: 200, // OK - Upload completed
                headers: {
                    'Tus-Resumable': '1.0.0',
                    'Upload-Offset': result.uploadOffset.toString(),
                    'Upload-Complete': 'true',
                }
            });
        } else {
            // Chunk uploaded, more chunks expected
            return new Response(null, {
                status: 204, // No Content - TUS protocol for partial upload
                headers: {
                    'Tus-Resumable': '1.0.0',
                    'Upload-Offset': result.uploadOffset.toString(),
                }
            });
        }

    } catch (error) {
        console.error('Error uploading photo chunk:', error);
        
        // Return TUS-compliant error response
        return new Response(JSON.stringify({
            error: error instanceof Error ? error.message : 'Chunk upload failed'
        }), {
            status: 400, // Bad Request
            headers: {
                'Tus-Resumable': '1.0.0',
                'Content-Type': 'application/json',
            }
        });
    }
}

