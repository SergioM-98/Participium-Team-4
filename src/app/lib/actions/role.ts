"use server";

import { decrypt } from "@/services/session";
import { cookies } from "next/headers";
import { RoleController } from "@/controllers/role.controller";
import {
  CreateRoleInputSchema,
  CreateRoleResponse,
  RetrieveRolesResponse,
} from "@/app/lib/dtos/role.dto";

export async function createRole(
  formData: FormData
): Promise<CreateRoleResponse> {
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
      error: "Unauthorized: Only administrators can create roles",
    };
  }

  const validatedData = CreateRoleInputSchema.safeParse({
    name: formData.get("name"),
    level: formData.get("level"),
  });

  if (!validatedData.success) {
    return { success: false, error: "Invalid input data" };
  }

  const controller = new RoleController();
  const response = await controller.setRole(validatedData.data);

  return response;
}

export async function retrieveRoles(): Promise<RetrieveRolesResponse> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    return { success: false, error: "Unauthorized: No session" };
  }

  const payload = await decrypt(session);

  if (!payload) {
    return { success: false, error: "Unauthorized: Invalid session payload" };
  }

  const controller = new RoleController();
  const response = await controller.getAllRoles();

  return response;
}
