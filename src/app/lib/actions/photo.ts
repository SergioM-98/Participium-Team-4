"use server";

import { readFile } from "fs/promises";
import path from "path";

export async function getPhoto(fileName: string) {
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

    return {
      success: true,
      data: buffer,
      contentType: contentType,
    };
  } catch {
    return { success: false, error: "Photo not found" };
  }
}
