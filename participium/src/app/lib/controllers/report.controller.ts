"use server";
import { authOptions } from "@/auth";
import {
  AssignReportToOfficerResponse,
  ReportRegistrationResponse,
  reportRegistrationRequestSchema,
  ReportsByOfficerResponse,
  ReportsUnassignedResponse,
  UpdateReportStatusResponse,
  AssignReportToMaintainerResponse,
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
  anonymous: boolean,
): Promise<ReportRegistrationResponse> {
  const session = await getServerSession(authOptions);
  if (!session || (session && !session.user.role.includes("CITIZEN"))) {
    console.error("Unauthorized report attempt");
    return { success: false, error: "Unauthorized report" };
  }
  const reportData = reportRegistrationRequestSchema.safeParse({
    title,
    description,
    photos,
    category: category,
    longitude,
    latitude,
    userId: session.user.id,
    anonymous,
  });
  if (!reportData.success) {
    console.error("Invalid report data:", reportData.error);
    return {
      success: false,
      error: "Invalid inputs",
    };
  }
  const reportCreationService = ReportCreationService.getInstance();
  try {
    return await reportCreationService.createReport(reportData.data);
  } catch (error) {
    console.error("Error creating report:", error);
    return { success: false, error: "Failed to create report" };
  }
}

export async function getReportsByOfficerId(): Promise<ReportsByOfficerResponse> {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session &&
      !session.user.role.includes("TECHNICAL_OFFICER") &&
      !session.user.role.includes("EXTERNAL_MAINTAINER_WITH_ACCESS"))
  ) {
    return { success: false, error: "Unauthorized access" };
  }

  const reportRetrievalService = ReportRetrievalService.getInstance();
  return reportRetrievalService.retrieveReportsByOfficerId(session.user.id);
}

export async function getReportsByMaintainerId(): Promise<ReportsByOfficerResponse> {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session &&
      !session.user.role.includes("TECHNICAL_OFFICER") &&
      !session.user.role.includes("EXTERNAL_MAINTAINER_WITH_ACCESS"))
  ) {
    return { success: false, error: "Unauthorized access" };
  }

  const reportRetrievalService = ReportRetrievalService.getInstance();
  return reportRetrievalService.retrieveReportsByMaintainerId(session.user.id);
}

export async function getPendingApprovalReports(
  status: string,
): Promise<ReportsUnassignedResponse> {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (session && !session.user.role.includes("PUBLIC_RELATIONS_OFFICER"))
  ) {
    console.error(
      "Unauthorized access attempt to get pending approval reports",
    );
    return { success: false, error: "Unauthorized access" };
  }

  const reportRetrievalService = ReportRetrievalService.getInstance();
  return reportRetrievalService.retrievePendingApprovalReports(status);
}

export async function approveReport(
  reportId: number,
  departmentOrCompanyId: string,
): Promise<AssignReportToOfficerResponse> {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (!session.user.role.includes("PUBLIC_RELATIONS_OFFICER") &&
      !session.user.role.includes("ADMIN"))
  ) {
    console.error("Unauthorized access attempt to approve report");
    return { success: false, error: "Unauthorized access" };
  }

  const reportAssignmentService = ReportAssignmentService.getInstance();
  try {
    return await reportAssignmentService.assignReportToOfficer(
      reportId,
      departmentOrCompanyId,
    );
  } catch (error) {
    console.error("Error approving report:", error);
    return {
      success: false,
      error: "The selected department could not be assigned",
    };
  }
}

export async function assignReportToCompany(
  reportId: number,
  companyId: string,
): Promise<AssignReportToMaintainerResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user.role.includes("TECHNICAL_OFFICER")) {
    console.error("Unauthorized access attempt to assign report to company");
    return { success: false, error: "Unauthorized access" };
  }
  const reportAssignmentService = ReportAssignmentService.getInstance();
  try {
    return await reportAssignmentService.assignReportToCompany(
      reportId,
      companyId,
    );
  } catch (error) {
    console.error("Error assigning report to company:", error);
    return { success: false, error: "Failed to assign report to company" };
  }
}

export async function rejectReport(
  reportId: number,
  rejectionReason: string,
): Promise<AssignReportToOfficerResponse> {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (!session.user.role.includes("PUBLIC_RELATIONS_OFFICER") &&
      !session.user.role.includes("ADMIN"))
  ) {
    console.error("Unauthorized access attempt to reject report");
    return { success: false, error: "Unauthorized access" };
  }

  const reportAssignmentService = ReportAssignmentService.getInstance();
  return reportAssignmentService.rejectReport(reportId, rejectionReason);
}

export async function updateReportStatus(
  status: string,
  reportId: string,
): Promise<UpdateReportStatusResponse> {
  const session = await getServerSession(authOptions);
  if (
    status !== "IN_PROGRESS" &&
    status !== "RESOLVED" &&
    status != "SUSPENDED"
  ) {
    console.error("Invalid status update attempt:", status);
    return { success: false, error: "Invalid status" };
  }

  if (
    !session ||
    (session &&
      !session.user.role.includes("TECHNICAL_OFFICER") &&
      !session.user.role.includes("EXTERNAL_MAINTAINER_WITH_ACCESS"))
  ) {
    return { success: false, error: "Unauthorized access" };
  }

  const reportUpdateService = ReportUpdateService.getInstance();
  return reportUpdateService.updateReportStatus(reportId, status);
}
