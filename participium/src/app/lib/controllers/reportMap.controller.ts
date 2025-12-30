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

export async function getApprovedReportsForPublic() {
  const service = ReportMapService.getInstance();
  const repoResult = await service.getPublicApprovedReports();

  if (!repoResult || repoResult.success === false || !repoResult.data) {
    return { success: false, error: "No reports found" };
  }

  const data = repoResult.data.map((r: any) => ({
    id: r.id.toString(),
    title: r.title,
    longitude: r.longitude,
    latitude: r.latitude,
    category: r.category,
    username: r.citizen?.username,
    citizenId: r.citizenId,
    status: r.status,
  }));

  return { success: true, data };
}

export async function getReportById(params: { id: string }) {
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
  const reportData = repoResult.data as any;
  const processedPhotos = await Promise.all(
    (reportData.photos || []).map(async (p: any) => {
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

  
  const isAnonymous = reportData.anonymous === true && currentUserId !== reportData.citizenId;

  const data = {
    id: reportData.id.toString(),
    title: reportData.title,
    description: reportData.description,
    longitude: reportData.longitude,
    latitude: reportData.latitude,
    createdAt: reportData.createdAt.toISOString(),
    category: reportData.category,
    status: reportData.status,
    username: isAnonymous ? null : reportData.citizen?.username,
    citizenId: isAnonymous ? null : reportData.citizenId,
    officerId: reportData.officerId || null,
    companyId: reportData.companyId || null,
    anonymous: reportData.anonymous || false,
    photos: processedPhotos.filter((url) => url !== null)
  };

  return { success: true, data };
}