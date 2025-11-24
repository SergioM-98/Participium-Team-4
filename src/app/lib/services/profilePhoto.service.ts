import { PhotoRepository } from "@/repositories/photo.repository";
import {
  CreateUploadRequest,
  CreateUploadRequestSchema,
  DeletePhotoRequest,
  DeletePhotoRequestSchema,
  GetPhotoStatusRequest,
  GetPhotoStatusRequestSchema,
  TusCreateResponse,
  TusCreateResponseSchema,
  TusDeleteResponse,
  TusDeleteResponseSchema,
  TusStatusResponse,
  TusStatusResponseSchema,
  TusUpdateResponse,
  TusUploadResponseSchema,
  UpdatePhotoRequest,
  UpdatePhotoRequestSchema,
} from "@/dtos/tus.dto";
import { appendFile, rename, unlink } from "fs/promises";
import path from "path";
import { ProfilePhotoRepository } from "../repositories/profilePhotos.repository";
import { savePhotoFile } from "../utils/fileUtils";

class ProfilePhotoService {
  private static instance: ProfilePhotoService;
  private profilePhotoRepository: ProfilePhotoRepository;
  private uploadsDir = path.join(process.cwd(), "uploads", "profile-photos");
  private constructor() {
    this.profilePhotoRepository = ProfilePhotoRepository.getInstance();
  }

  public static getInstance(): ProfilePhotoService {
    if (!ProfilePhotoService.instance) {
      ProfilePhotoService.instance = new ProfilePhotoService();
    }
    return ProfilePhotoService.instance;
  }

  public async deletePhoto(userId: string): Promise<TusDeleteResponse> {
    try {
      // Get photo record from database
      const photo = await this.profilePhotoRepository.getPhotoOfUser(userId);
      if (!photo) {
        throw new Error(`Photo for user ID ${userId} not found`);
      }

      try {
        // Delete file from filesystem
        await unlink(photo.url.replace("/uploads/", ""));
        console.log(`File deleted: ${photo.url}`);
      } catch (fileError) {
        // Log file deletion error but continue with database deletion
        console.warn(`Failed to delete file ${photo.url}:`, fileError);
      }

      // Delete photo record from database
      await this.profilePhotoRepository.delete(photo.id);
      console.log(`Photo record deleted from database: ${photo.id}`);

      const response: TusDeleteResponse = TusDeleteResponseSchema.parse({
        success: true,
        message: "Photo deleted successfully",
      });

      return response;
    } catch (error) {
      console.error("Error in deletePhoto:", error);

      const response: TusDeleteResponse = TusDeleteResponseSchema.parse({
        success: false,
        message: `Failed to delete photo: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });

      return response;
    }
  }

  public async createUploadPhoto(
    request: CreateUploadRequest,
    userId: string
  ): Promise<TusCreateResponse> {
    try {
      const validatedRequest = CreateUploadRequestSchema.parse(request);

      if (validatedRequest.body.byteLength !== validatedRequest.uploadLength) {
        throw new Error("Body length does not match upload-length");
      }

      const originalName = this.extractAndSanitizeFilename(
        validatedRequest.uploadMetadata,
        validatedRequest.photoId
      );

      const ext = this.getFileExtension(originalName);
      const finalFilename = `${userId}${ext}`;

      const uploadsDir =
        process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");

      const tempFilename = `${validatedRequest.photoId}_temp${ext}`;
      const tempFilePath = path.join(uploadsDir, tempFilename);
      const finalFilePath = path.join(uploadsDir, finalFilename);

      const savedFileSize = await savePhotoFile(
        validatedRequest.body,
        tempFilePath
      );

      if (savedFileSize !== validatedRequest.uploadLength) {
        throw new Error(
          `File size mismatch: expected ${validatedRequest.uploadLength}, got ${savedFileSize}`
        );
      }

      const isComplete = savedFileSize === validatedRequest.uploadLength;

      if (isComplete) {
        try {
          const oldPhoto = await this.profilePhotoRepository.getPhotoOfUser(
            userId
          );
          if (oldPhoto) {
            await unlink(
              oldPhoto.url.replace("/uploads/", path.join(uploadsDir, ""))
            );
            console.log(`Old file removed: ${finalFilePath}`);
          }
        } catch (err: any) {
          //ignore errors if file does not exist
          //then only throw if other error
          if (err.code !== "ENOENT") {
            throw new Error("Failed to delete old file:", err);
          }
        }
        try {
          await rename(tempFilePath, finalFilePath);
        } catch (renameErr) {
          console.error("Rename failed:", renameErr);
        }
      }

      const record = await this.profilePhotoRepository.create({
        id: validatedRequest.photoId,
        url: isComplete
          ? path.join(uploadsDir, finalFilename)
          : path.join(uploadsDir, tempFilename),
        size: BigInt(validatedRequest.uploadLength),
        offset: BigInt(savedFileSize),
        filename: finalFilename,
        userId,
      });

      return TusCreateResponseSchema.parse({
        location: record.id,
        uploadOffset: savedFileSize,
      });
    } catch (error) {
      console.error("Error in createUploadPhoto:", error);
      throw new Error("Failed to create upload");
    }
  }

  /**
   * Extract filename from TUS upload-metadata header and sanitize it
   * TUS metadata format: "filename dGVzdC5qcGc=,filetype aW1hZ2UvanBlZw=="
   */
  private extractAndSanitizeFilename(
    metadata: string | undefined,
    fallbackId: string
  ): string {
    if (!metadata) {
      return `photo_${fallbackId.substring(0, 8)}.jpg`;
    }

    try {
      const pairs = metadata.split(",");
      let filename = "";

      for (const pair of pairs) {
        const [key, encodedValue] = pair.trim().split(" ");
        if (key === "filename" && encodedValue) {
          filename = Buffer.from(encodedValue, "base64").toString("utf-8");
          break;
        }
      }

      if (!filename) {
        return `photo_${fallbackId.substring(0, 8)}.jpg`;
      }

      return this.sanitizeFilename(filename);
    } catch (error) {
      console.warn("Failed to parse TUS metadata:", error);
      return `photo_${fallbackId.substring(0, 8)}.jpg`;
    }
  }

  /**
   * Sanitize filename to prevent path traversal and invalid characters
   */
  private sanitizeFilename(filename: string): string {
    let sanitized = filename
      .replace(/[\/\\]/g, "")
      .replace(/[<>:"|?*\x00-\x1f]/g, "")
      .replace(/^\.+/, "")
      .trim();

    if (!sanitized || sanitized.length === 0) {
      sanitized = "photo";
    }

    if (sanitized.length > 100) {
      const ext = path.extname(sanitized);
      const name = path.basename(sanitized, ext).substring(0, 96);
      sanitized = name + ext;
    }

    if (!path.extname(sanitized)) {
      sanitized += ".jpg";
    }

    return sanitized;
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const ext = path.extname(filename);
    return ext || ".jpg";
  }

  async getPhotoOfUser(userId: string) {
    return await this.profilePhotoRepository.getPhotoOfUser(userId);
  }
}

export { ProfilePhotoService };
