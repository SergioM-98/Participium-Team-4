import { ReportMapService } from "@/services/reportMap.service";
import { z } from "zod";

const idSchema = z.string();

export async function getApprovedReportsForMap() {
  const service = ReportMapService.getInstance();
  const repoResult = await service.getReportsForMap();

  if (!repoResult || repoResult.success === false || !repoResult.data || repoResult.data.length === 0) {
    return { success: false, error: repoResult?.error || "No reports found" };
  }

  const data = repoResult.data.map((r: any) => ({
    id: r.id.toString(),
    title: r.title,
    longitude: r.longitude,
    latitude: r.latitude,
    username: r.citizen?.username
  }));

  return { success: true, data };
}

export async function getReportById(params: { id: string }) {
  const parse = idSchema.safeParse(params.id);
  if (!parse.success) {
    return { success: false, error: "Invalid report id" };
  }
  const service = ReportMapService.getInstance();
  const repoResult = await service.getReportById(params.id);

  if (!repoResult || repoResult.success === false || !repoResult.data) {
    return { success: false, error: repoResult?.error || "Report not found" };
  }

  const data = {
    id: repoResult.data.id.toString(),
    title: repoResult.data.title,
    description: repoResult.data.description,
    longitude: repoResult.data.longitude,
    latitude: repoResult.data.latitude,
    createdAt: repoResult.data.createdAt,
    username: repoResult.data.citizen?.username
  };

  return { success: true, data };
}
