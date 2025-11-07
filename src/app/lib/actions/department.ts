"use server";

import { cookies } from "next/headers";
import { decrypt } from "@/services/session";
import {
  CreateDepartmentInputSchema,
  RetrieveDepartmentsResponse,
} from "@/app/lib/dtos/department.dto";
import { DepartmentController } from "@/controllers/department.controller";

export async function retrieveDepartments(): Promise<RetrieveDepartmentsResponse> {
  const controller = new DepartmentController();
  return await controller.retrieveDepartments();
}

export async function createDepartment(formData: FormData) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    return { success: false, error: "Unauthorized: No session" };
  }

  const payload = await decrypt(session);

  if (!payload) {
    return { success: false, error: "Unauthorized: Invalid session payload" };
  }

  if (payload.role !== "admin") {
    return {
      success: false,
      error: "Unauthorized: Only administrators can create departments",
    };
  }

  const validatedData = CreateDepartmentInputSchema.safeParse({
    name: formData.get("name"),
  });

  if (!validatedData.success) {
    return { success: false, error: "Invalid input data" };
  }

  const controller = new DepartmentController();
  return await controller.createDepartment(validatedData.data);
}
