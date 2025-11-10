"use server";

import { decrypt } from "@/services/session";
import { cookies } from "next/headers";
import { MunicipalityUserController } from "@/controllers/municipalityUser.controller";
import {
  SetRoleInputSchema,
  SetRoleResponse,
} from "@/app/lib/dtos/municipalityUser.dto";

export async function assignRole(formData: FormData): Promise<SetRoleResponse> {
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
      error: "Unauthorized: Only administrators can assign roles",
    };
  }

  const validatedData = SetRoleInputSchema.safeParse({
    id: formData.get("id"),
    role: formData.get("role"),
  });

  if (!validatedData.success) {
    return { success: false, error: "Invalid input data" };
  }

  const controller = new MunicipalityUserController();
  const response = await controller.setRole(validatedData.data);

  return response;
}
