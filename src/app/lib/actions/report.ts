"use server";

import { cookies } from "next/headers";
import { decrypt } from "@/services/session";
import {
  CreateReviewResponse,
  CreateReviewInputSchema,
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
    decision: formData.get("decision"),
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

export async function retrieveValidReports() {
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
      error: "Unauthorized: Only employees can access valid reports",
    };
  }

  const controller = new ReportController();
  return await controller.retrieveValidReports();
}
