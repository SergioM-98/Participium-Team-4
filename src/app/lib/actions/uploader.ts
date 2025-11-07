'use server'

import { UploaderController } from '@/controllers/uploader.controller';

const controller = new UploaderController();

export async function createUploadPhoto(formData: FormData) {
    const tusResumable = formData.get('tus-resumable') as string;
    const uploadLength = formData.get('upload-length') as string;
    const uploadMetadata = formData.get('upload-metadata') as string | null;
    const file = formData.get('file') as File | null;

    const data = {
        'tus-resumable': tusResumable,
        'upload-length': parseInt(uploadLength) as number,
        'upload-metadata': uploadMetadata || undefined,
        'content-length': file ? file.size : 0,
    };

    // Convert file to ArrayBuffer if present
    const bodyBytes = file ? await file.arrayBuffer() : new ArrayBuffer(0);

    return controller.createUploadPhoto(data, bodyBytes);
}

export async function uploadPhotoChunk(uploadId: string, formData: FormData) {
    const tusResumable = formData.get('tus-resumable') as string;
    const uploadOffset = formData.get('upload-offset') as string;
    const contentType = formData.get('content-type') as string;
    const chunk = formData.get('chunk') as File | null;

    if (!chunk) {
        return {
            success: false,
            error: 'No chunk data provided',
            tusHeaders: { 'Tus-Resumable': '1.0.0' }
        };
    }

    const data = {
        'tus-resumable': tusResumable,
        'upload-offset': parseInt(uploadOffset) as number,
        'content-type': contentType,
        'content-length': chunk.size,
    };

    const chunkBytes = await chunk.arrayBuffer();

    return controller.uploadPhotoChunk(uploadId, data, chunkBytes);
}

export async function getUploadStatus(uploadId: string, tusResumable: string = '1.0.0') {
    const data = {
        'tus-resumable': tusResumable,
    };

    return controller.getUploadStatus(uploadId, data);
}

export async function deleteUpload(uploadId: string, tusResumable: string = '1.0.0') {
    const data = {
        'tus-resumable': tusResumable,
    };

    return controller.deleteUpload(uploadId, data);
}

export async function getTusOptions() {
    return controller.getTusOptions();
}

