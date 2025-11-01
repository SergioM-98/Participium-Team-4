'use server'

import {headers} from 'next/headers';
import {TusCreateHeadersSchema} from '@/dtos/tus.header.dto';
import { UploaderCreateService } from '@/services/uploaderCreate.services';


export async function createUploadPhotoUrl(Request: Request) {
    
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
    
    const uploaderCreateService = UploaderCreateService.getInstance();
    const result = await uploaderCreateService.createUploadPhotoUrl(validatedHeaders, bodyBytes);
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

