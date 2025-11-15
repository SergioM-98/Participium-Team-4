"use server";

import {
  ReportRegistrationResponse,
  reportRequestSchema,
} from "@/dtos/report.dto";
import { ReportController } from "@/controllers/report.controller";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

export async function createReport(
  title: string,
  description: string,
  photos: string[],
  category: string,
  longitude: number,
  latitude: number,
  userId: string,
  isAnonymous: boolean
): Promise<ReportRegistrationResponse> {
  const session = await getServerSession(authOptions);

  const reportData = reportRequestSchema.safeParse({
    title,
    description,
    photos,
    category: category,
    longitude,
    latitude,
    userId,
    isAnonymous,
  });

  if (!reportData.success) {
    return {
      success: false,
      error: "Invalid inputs",
    };
  }

  if (!session || (session && session.user.role !== "CITIZEN")) {
    return { success: false, error: "Unauthorized report" };
  }

  const reportController = new ReportController();
  return await reportController.createReport(reportData.data);
}

export async function retrieveReportsByOfficerId() {
  const session = await getServerSession(authOptions);

  if (!session || (session && session.user.role !== "OFFICER")) {
    return { success: false, error: "Unauthorized access" };
  }

  const reportController = new ReportController();
  return await reportController.getReportsByOfficerId(Number(session.user.id));
}
