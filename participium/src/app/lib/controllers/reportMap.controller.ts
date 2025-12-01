"use server";
import { ReportMapService } from "../services/reportMap.service";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";

const idSchema = z.string();

export async function getApprovedReportsForMap() {
  const service = ReportMapService.getInstance();
  let repoResult;
  try {
    repoResult = await service.getReportsForMap();
  } catch (error) {
    console.error("Error getting reports for map:", error);
    return { success: false, error: "Failed to get reports" };
  }

  if (!repoResult || repoResult.success === false || !repoResult.data || repoResult.data.length === 0) {
    return { success: false, error: repoResult?.error || "No reports found" };
  }

  const data = repoResult.data.map((r: any) => ({
    id: r.id.toString(),
    title: r.title,
    longitude: r.longitude,
    latitude: r.latitude,
    category: r.category,
    username: r.citizen?.username
  }));

  return { success: true, data };
}

export async function getReportById(params: { id: string }) {
  const parse = idSchema.safeParse(params.id);
  if (!parse.success) {
    console.error("Invalid report id:", params.id);
    return { success: false, error: "Invalid report id" };
  }
  const service = ReportMapService.getInstance();
  let repoResult;
  try {
    repoResult = await service.getReportById(params.id);
  } catch (error) {
    console.error("Error getting report by id:", error);
    return { success: false, error: "Failed to get report" };
  }
  if (!repoResult || repoResult.success === false || !repoResult.data) {
    return { success: false, error: repoResult?.error || "Report not found" };
  }
  const processedPhotos = await Promise.all(
    repoResult.data.photos.map(async (p: any) => {
      try {
        console.log('Processing photo URL:', p.url);
        const filename = path.basename(p.url);
        const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
        console.log('Uploads Directory:', uploadsDir);
        const filePath = path.join(uploadsDir, filename);
        const fileBuffer = await fs.readFile(filePath);
        const ext = path.extname(filename).toLowerCase();
        let mime: string;
        if (ext === ".jpg" || ext === ".jpeg") {
          mime = "image/jpeg";
        } else if (ext === ".webp") {
          mime = "image/webp";
        } else {
          mime = "image/png";
        }
        return `data:${mime};base64,${fileBuffer.toString("base64")}`;
      } catch (error) {
        console.error(`Failed to load report photo ${p.url}:`, error);
        return null;
      }
    })
  );

  

  const data = {
    id: repoResult.data.id.toString(),
    title: repoResult.data.title,
    description: repoResult.data.description,
    longitude: repoResult.data.longitude,
    latitude: repoResult.data.latitude,
    createdAt: repoResult.data.createdAt.toISOString(),
    category: repoResult.data.category,
    status: repoResult.data.status,
    username: repoResult.data.citizen?.username,
    citizenId: repoResult.data.citizenId,
    officerId: repoResult.data.officerId,
    photos: processedPhotos.filter((url) => url !== null) as string[]
  };

  return { success: true, data };
}