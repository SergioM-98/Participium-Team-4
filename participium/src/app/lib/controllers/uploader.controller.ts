"use server";
import { TusCreateDataSchema } from '../dtos/tus.header.dto';
import { 
    CreateUploadRequest, 
    DeletePhotoRequest,
    ControllerSuccessResponse 
} from '../dtos/tus.dto';
import { PhotoUploaderService } from '../services/photoUpload.service';
import { PhotoDeleteService } from '../services/photoDelete.service';



    export async function createUploadPhoto(formData: FormData): Promise<ControllerSuccessResponse> {
        let tusResumable: string;
        let uploadLength: number;
        let uploadMetadata: string | null;
        let file: File | null;
        try {
            tusResumable = formData.get('tus-resumable') as string;
            uploadLength = Number.parseInt(formData.get('upload-length') as string);
            uploadMetadata = formData.get('upload-metadata') as string | null;
            file = formData.get('file') as File | null;
        } catch (error) {
            console.error("Error processing upload photo form data:", error);
            throw error;
        }
    
        const data = {
            'tus-resumable': tusResumable,
            'upload-length': uploadLength,
            'upload-metadata': uploadMetadata || undefined,
            'content-length': file ? file.size : 0,
        };
    
        // Convert file to ArrayBuffer if present
        const bodyBytes = file ? await file.arrayBuffer() : new ArrayBuffer(0);
        const validatedData = TusCreateDataSchema.safeParse(data);
        if(!validatedData.success){
            console.error("Error validating Tus create data:", validatedData.error);
            return { success: false, error: "Invalid upload data", tusHeaders: {} };
        }

        // Generate photo ID and create service request DTO
        const photoId = crypto.randomUUID();
        const serviceRequest: CreateUploadRequest = {
            uploadLength: validatedData.data['upload-length'],
            uploadMetadata: validatedData.data['upload-metadata'],
            body: bodyBytes,
            photoId: photoId
        };

        const uploaderService = PhotoUploaderService.getInstance();
        try {
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
        } catch (error) {
            console.error("Error creating upload photo:", error);
            return { success: false, error: "Failed to create upload photo", tusHeaders: {} };
        }
    }






    export async function deleteUpload(uploadId: string, tusResumable: string = '1.0.0'): Promise<ControllerSuccessResponse>  {
        
        // Create service request DTO
        const serviceRequest: DeletePhotoRequest = {
            photoId: uploadId
        };

        const uploaderService = PhotoDeleteService.getInstance();
        let result;
        try {
            result = await uploaderService.deletePhoto(serviceRequest);
        } catch (error) {
            console.error("Error deleting upload photo:", error);
            return { success: false, error: "Failed to delete upload photo", tusHeaders: {} };
        }

        if (!result.success) {
            console.error("Error deleting upload photo: ", uploadId);
            return { success: false, error: "Failed to delete upload photo", tusHeaders: {} };
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