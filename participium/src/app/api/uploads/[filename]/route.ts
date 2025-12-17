"use server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ filename: string }> },
): Promise<Response> {
  try {
    const { filename } = await params;

    // Prevent path traversal
    if (filename.includes("..") || filename.includes("/")) {
      return new Response("Forbidden", { status: 403 });
    }

    const uploadsDir =
      process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadsDir, filename);

    if (!filePath.startsWith(uploadsDir)) {
      return new Response("Forbidden", { status: 403 });
    }

    const fileBuffer = await readFile(filePath);

    // Determine MIME type
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.log("Error serving photo:", error);
    return new Response("Not Found", { status: 404 });
  }
}
