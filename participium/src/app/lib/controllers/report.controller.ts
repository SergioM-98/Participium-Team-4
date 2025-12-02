"use server";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import {
  AssignReportToOfficerResponse,
  ReportRegistrationResponse,
  reportRequestSchema,
  ReportsByOfficerResponse,
  ReportsUnassignedResponse,
} from "../dtos/report.dto";
import { ReportCreationService } from "../services/reportCreation.service";
import { getServerSession } from "next-auth/next";
import { ReportRetrievalService } from "../services/reportRetrieval.service";
import { ReportAssignmentService } from "../services/reportAssignment.service";

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
    console.error("Unauthorized report attempt");
    return { success: false, error: "Unauthorized report" };
  }
  const reportData = reportRequestSchema.safeParse({
    title,
    description,
    photos,
    category: category,
    longitude,
    latitude,
    userId: session.user.id,
    isAnonymous,
  });
  if (!reportData.success) {
    console.error("Invalid report data:", reportData.error);
    return {
      success: false,
      error: "Invalid inputs",
    };
  }
  const reportCreationService = ReportCreationService.getInstance();
  try{
    return await reportCreationService.createReport(reportData.data);
  } catch (error) {
    console.error("Error creating report:", error);
    return { success: false, error: "Failed to create report" };
  }
}

export async function getReportsByOfficerId(
  officerId: string
): Promise<ReportsByOfficerResponse> {
  const session = await getServerSession(authOptions);

  if (!session || (session && session.user.role !== "TECHNICAL_OFFICER")) {
    console.error("Unauthorized access attempt to get reports by officer ID");
    return { success: false, error: "Unauthorized access" };
  }

  const reportRetrievalService = ReportRetrievalService.getInstance();
  try {
    return await reportRetrievalService.retrieveReportsByOfficerId(officerId);
  } catch (error) {
    console.error("Error retrieving reports by officer ID:", error);
    return { success: false, error: "Failed to retrieve reports" };
  }
}

export async function getPendingApprovalReports(
  status: string
): Promise<ReportsUnassignedResponse> {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session && session.user.role !== "PUBLIC_RELATIONS_OFFICER")
  ) {
    console.error("Unauthorized access attempt to get pending approval reports");
    return { success: false, error: "Unauthorized access" };
  }

  const reportRetrievalService = ReportRetrievalService.getInstance();
  try {
    return await reportRetrievalService.retrievePendingApprovalReports(status);
  } catch (error) {
    console.error("Error retrieving pending approval reports:", error);
    return { success: false, error: "Failed to retrieve reports" };
  }
}

export async function approveReport(
  reportId: number,
  department: string
): Promise<AssignReportToOfficerResponse> {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "PUBLIC_RELATIONS_OFFICER" &&
      session.user.role !== "ADMIN")
  ) {
    console.error("Unauthorized access attempt to approve report");
    return { success: false, error: "Unauthorized access" };
  }

  const reportAssignmentService = ReportAssignmentService.getInstance();
  try {
    return await reportAssignmentService.assignReportToOfficer(reportId, department);
  } catch (error) {
    console.error("Error approving report:", error);
    return { success: false, error: "Failed to approve report" };
  }
}

export async function rejectReport(
  reportId: number,
  rejectionReason: string
): Promise<AssignReportToOfficerResponse> {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session.user.role !== "PUBLIC_RELATIONS_OFFICER" &&
      session.user.role !== "ADMIN")
  ) {
    console.error("Unauthorized access attempt to reject report");
    return { success: false, error: "Unauthorized access" };

  }

  const reportAssignmentService = ReportAssignmentService.getInstance();
  try {
    return await reportAssignmentService.rejectReport(reportId, rejectionReason);
  } catch (error) {
    console.error("Error rejecting report:", error);
    return { success: false, error: "Failed to reject report" };
  }
}