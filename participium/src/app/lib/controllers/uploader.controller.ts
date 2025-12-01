"use server";
import { TusCreateDataSchema, TusUploadDataSchema, TusDeleteDataSchema, TusStatusDataSchema } from '../dtos/tus.header.dto';
import { 
    CreateUploadRequest, 
    UpdatePhotoRequest, 
    GetPhotoStatusRequest, 
    DeletePhotoRequest,
    ControllerSuccessResponse 
} from '../dtos/tus.dto';
import { PhotoUploaderService } from '../services/photoUpload.service';
import { PhotoUpdaterService } from '../services/photoUpdate.service';
import { PhotoDeleteService } from '../services/photoDelete.service';
import { PhotoStatusService } from '../services/photoStatus.service';



    export async function createUploadPhoto(formData: FormData): Promise<ControllerSuccessResponse> {
        const tusResumable = formData.get('tus-resumable') as string;
        const uploadLength = formData.get('upload-length') as string;
        const uploadMetadata = formData.get('upload-metadata') as string | null;
        const file = formData.get('file') as File | null;
    
        const data = {
            'tus-resumable': tusResumable,
            'upload-length': Number.parseInt(uploadLength),
            'upload-metadata': uploadMetadata || undefined,
            'content-length': file ? file.size : 0,
        };
    
        // Convert file to ArrayBuffer if present
        const bodyBytes = file ? await file.arrayBuffer() : new ArrayBuffer(0);
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




    export async function uploadPhotoChunk(uploadId: string, formData: FormData) : Promise<ControllerSuccessResponse> {
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
            'upload-offset': Number.parseInt(uploadOffset),
            'content-type': contentType,
            'content-length': chunk.size,
        };
    
        const chunkBytes = await chunk.arrayBuffer();
    
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


    export async function getUploadStatus(uploadId: string, tusResumable: string = '1.0.0'): Promise<ControllerSuccessResponse>  {
        const data = {
            'tus-resumable': tusResumable,
        };
    
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


    export async function deleteUpload(uploadId: string, tusResumable: string = '1.0.0'): Promise<ControllerSuccessResponse>  {
        const data = {
            'tus-resumable': tusResumable,
        };
    
        const validatedData = TusDeleteDataSchema.safeParse(data);

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

    export async function getTusOptions(): Promise<ControllerSuccessResponse> {
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