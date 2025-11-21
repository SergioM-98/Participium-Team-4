import { PhotoRepository } from "@/repositories/photo.repository";
import { readFile } from "fs/promises";
import path from "path";

class PhotoRetrievalService {
  private static instance: PhotoRetrievalService;
  private photoRepository: PhotoRepository;

  private constructor() {
    this.photoRepository = PhotoRepository.getInstance();
  }

  public static getInstance(): PhotoRetrievalService {
    if (!PhotoRetrievalService.instance) {
      PhotoRetrievalService.instance = new PhotoRetrievalService();
    }
    return PhotoRetrievalService.instance;
  }

  public async getPhoto(fileName: string) {
    try {
      const filePath = path.join(process.cwd(), "uploads", fileName);
      const buffer = await readFile(filePath);

      const extension = path.extname(fileName).toLowerCase();

      const mimeTypes: Record<string, string> = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
      };

      const contentType = mimeTypes[extension] || "image/jpeg";

      const base64 = buffer.toString("base64");
      const dataUrl = `data:${contentType};base64,${base64}`;

      return {
        success: true,
        data: dataUrl,
      };
    } catch (err) {
      return { success: false, error: "Photo not found" };
    }
  }
}

export { PhotoRetrievalService };
