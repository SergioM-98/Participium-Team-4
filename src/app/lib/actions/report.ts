"use server";

import { cookies } from "next/headers";
import { decrypt } from "@/services/session";
import {
  CreateReviewResponse,
  CreateReviewInputSchema,
  RetrieveReportsByStatusInputSchema,
} from "@/app/lib/dtos/report.dto";
import { ReportController } from "@/app/lib/controllers/report.controller";

export async function createReview(
  formData: FormData
): Promise<CreateReviewResponse> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    return { success: false, error: "Unauthorized: No session" };
  }

  const payload = await decrypt(session);

  if (!payload) {
    return { success: false, error: "Unauthorized: Invalid session payload" };
  }

  if (payload.role !== "municipal public relations officer") {
    return {
      success: false,
      error:
        "Unauthorized: Only municipal public relations officers can process incoming reports",
    };
  }

  const validatedData = CreateReviewInputSchema.safeParse({
    reportId: formData.get("reportId"),
    status: formData.get("status"),
    explaination: formData.get("explaination")
      ? String(formData.get("explaination"))
      : undefined,
    category: formData.get("category"),
  });

  if (!validatedData.success) {
    return { success: false, error: "Invalid input data" };
  }

  const controller = new ReportController();
  return await controller.createReview(validatedData.data);
}

export async function retrieveUnreviewedReports() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    return { success: false, error: "Unauthorized: No session" };
  }

  const payload = await decrypt(session);

  if (!payload) {
    return { success: false, error: "Unauthorized: Invalid session payload" };
  }

  if (!payload.role) {
    return {
      success: false,
      error: "Unauthorized: Only employees can access unreviewed reports",
    };
  }

  const controller = new ReportController();
  return await controller.retrieveUnreviewedReports();
}

export async function retrieveReportsByStatus(
  userData: FormData
): Promise<any> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  const validatedData = RetrieveReportsByStatusInputSchema.safeParse({
    status: userData.get("status"),
  });

  if (!validatedData.success) {
    return { success: false, error: "Invalid input data" };
  }

  if (!session) {
    return { success: false, error: "Unauthorized: No session" };
  }

  const payload = await decrypt(session);

  if (!payload) {
    return { success: false, error: "Unauthorized: Invalid session payload" };
  }

  if (!payload.role) {
    return {
      success: false,
      error: "Unauthorized: Only employees can access valid reports",
    };
  }

  const controller = new ReportController();
  return await controller.retrieveReportsByStatus(validatedData.data);
}

export async function reportCreation(
  title: string,
  description: string,
  photos: string[],
  longitude: number,
  latitude: number,
  userId: string
) {
  const uuid = crypto.randomUUID();
  const controller = new ReportController();
  
  return await controller.createReport(
    uuid,
    title,
    description,
    photos,
    longitude,
    latitude,
    userId
  );
}
