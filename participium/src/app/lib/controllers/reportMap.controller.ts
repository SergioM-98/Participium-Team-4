"use server";
import { ReportMapService } from "@/services/reportMap.service";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import { ReportForMapResponse, ReportByIdResponse } from "@/dtos/report.dto";

const idSchema = z.string();

export async function getReportsForMap(): Promise<ReportForMapResponse> {
  const { getServerSession } = await import("next-auth/next");
  const { authOptions } = await import("@/auth");
    const service = ReportMapService.getInstance();
    const session = await getServerSession(authOptions);

    const userId = session?.user?.id;
    const role = session?.user?.role;
    const repoResult = await service.getReportsForMap(userId, role);

    if (!repoResult || repoResult.success === false || !repoResult.data) {
      return { success: false, error: "No reports found" };
    }

    const data = repoResult.data.map((report: any) => {
      const isAnonymous = report.anonymous === true && userId !== report.citizenId;
      
      return {
        id: report.id.toString(),
        title: report.title,
        description: report.description || "",
        photos: report.photos || [],
        category: report.category,
        longitude: report.longitude,
        latitude: report.latitude,
        citizenUsername: isAnonymous ? undefined : report.citizen?.username,
        citizenId: isAnonymous ? null : report.citizenId,
        status: report.status,
        anonymous: isAnonymous,
      };
    });

    return { success: true, data };
}

export async function getReportById(params: { id: string }): Promise<ReportByIdResponse> {
  const parse = idSchema.safeParse(params.id);
  if (!parse.success) {
    console.error("Invalid report id:", params.id);
    return { success: false, error: "Invalid report id" };
  }
  
  const { getServerSession } = await import("next-auth/next");
  const { authOptions } = await import("@/auth");
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;
  
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

  
  const isAnonymous = repoResult.data.anonymous === true && currentUserId !== repoResult.data.citizenId;

  const data = {
    id: repoResult.data.id.toString(),
    title: repoResult.data.title,
    description: repoResult.data.description,
    longitude: repoResult.data.longitude,
    latitude: repoResult.data.latitude,
    createdAt: repoResult.data.createdAt.toISOString(),
    category: repoResult.data.category,
    status: repoResult.data.status,
    username: isAnonymous ? null : repoResult.data.citizen?.username,
    citizenId: isAnonymous ? null : repoResult.data.citizenId,
    anonymous: repoResult.data.anonymous || false,
    photos: processedPhotos.filter((url) => url !== null)
  };

  return { success: true, data };
}