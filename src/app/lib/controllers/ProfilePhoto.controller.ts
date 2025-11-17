import { ControllerSuccessResponse, CreateUploadRequest, DeletePhotoRequest, GetPhotoStatusRequest, UpdatePhotoRequest } from "../dtos/tus.dto";
import { TusCreateDataSchema, TusDeleteData, TusDeleteDataSchema, TusStatusData, TusStatusDataSchema, TusUploadDataSchema } from "../dtos/tus.header.dto";
import { ProfilePhotoService } from "../services/profilePhoto.service";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

class ProfilePhotoController {
    constructor(
    private profilePhotoService = ProfilePhotoService.getInstance()
  ) {}

    async createUploadPhoto(formData: FormData) : Promise<ControllerSuccessResponse> {
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
  
        const validatedData = TusCreateDataSchema.parse(data);

        // Generate photo ID and create service request DTO
        const photoId = crypto.randomUUID();
        const serviceRequest: CreateUploadRequest = {
            uploadLength: validatedData['upload-length'],
            uploadMetadata: validatedData['upload-metadata'],
            body: bodyBytes,
            photoId: photoId
        };

        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id || session.user?.role !== "CITIZEN") {
            throw new Error("Unauthorized access");
        }

        const result = await this.profilePhotoService.createUploadPhoto(serviceRequest, session.user.id);

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

export { ProfilePhotoController };