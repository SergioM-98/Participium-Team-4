("use server");
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  ReportRegistrationResponse,
  reportRequestSchema,
  ReportsByOfficerResponse,
  ReportsUnassignedResponse,
} from "@/dtos/report.dto";
import { ReportCreationService } from "@/services/reportCreation.service";
import { getServerSession } from "next-auth/next";
import { ReportRetrievalService } from "@/services/reportRetrieval.service";

export async function createReport(
  title: string,
  description: string,
  photos: string[],
  category: string,
  longitude: number,
  latitude: number,
  isAnonymous: boolean
): Promise<ReportRegistrationResponse> {
  const session = await getServerSession(authOptions);
  if (!session || (session && session.user.role !== "CITIZEN")) {
    return { success: false, error: "Unauthorized report" };
  }
  const reportData = reportRequestSchema.safeParse({
    title,
    description,
    photos,
    category: category,
    longitude,
    latitude,
    userId: isAnonymous ? 2 : session.user.id,
    isAnonymous,
  });
  if (!reportData.success) {
    return {
      success: false,
      error: "Invalid inputs",
    };
  }
  const reportCreationService = ReportCreationService.getInstance();
  return reportCreationService.createReport(reportData.data);
}

export async function getReportsByOfficerId(
  officerId: number
): Promise<ReportsByOfficerResponse> {
  const session = await getServerSession(authOptions);

  if (!session || (session && session.user.role !== "OFFICER")) {
    return { success: false, error: "Unauthorized access" };
  }

  const reportRetrievalService = ReportRetrievalService.getInstance();
  return reportRetrievalService.retrieveReportsByOfficerId(officerId);
}

export async function getPendingApprovalReports(
  status: string
): Promise<ReportsUnassignedResponse> {
  const session = await getServerSession(authOptions);

  if (!session || (session && session.user.role !== "ADMIN")) {
    return { success: false, error: "Unauthorized access" };
  }

  const reportRetrievalService = ReportRetrievalService.getInstance();
  return reportRetrievalService.retrievePendingApprovalReports(status);
}
