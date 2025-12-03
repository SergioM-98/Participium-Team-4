"use server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  AssignReportToOfficerResponse,
  ReportRegistrationResponse,
  reportRequestSchema,
  ReportsByOfficerResponse,
  ReportsUnassignedResponse,
  UpdateReportStatusResponse,
} from "@/dtos/report.dto";
import { ReportCreationService } from "@/services/reportCreation.service";
import { getServerSession } from "next-auth/next";
import { ReportRetrievalService } from "@/services/reportRetrieval.service";
import { ReportAssignmentService } from "@/services/reportAssignment.service";
import { ReportUpdateService } from "@/services/reportUpdate.service";

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

export async function getReportsByAssigneeId(): Promise<ReportsByOfficerResponse> {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session &&
      session.user.role !== "TECHNICAL_OFFICER" &&
      session.user.role !== "EXTERNAL_MAINTAINER_WITH_ACCESS")
  ) {
    return { success: false, error: "Unauthorized access" };
  }

  const reportRetrievalService = ReportRetrievalService.getInstance();
  return reportRetrievalService.retrieveReportsByOfficerId(session.user.id);
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
  departmentOrCompanyId: string,
  isCompany: boolean = false
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

  if (isCompany) {
    return reportAssignmentService.assignReportToCompany(reportId, departmentOrCompanyId);
  } else {
    return reportAssignmentService.assignReportToOfficer(reportId, departmentOrCompanyId);
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
  return reportAssignmentService.rejectReport(reportId, rejectionReason);
}

export async function updateReportStatus(
  status: string,
  reportId: string
): Promise<UpdateReportStatusResponse> {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session &&
      session.user.role !== "TECHNICAL_OFFICER" &&
      session.user.role !== "EXTERNAL_MAINTAINER_WITH_ACCESS")
  ) {
    return { success: false, error: "Unauthorized access" };
  }

  const reportUpdateService = ReportUpdateService.getInstance();
  return reportUpdateService.updateReportStatus(reportId, status);
}
