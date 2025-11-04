"use server";

import {
  LoginInputSchema,
  LoginResponse,
  RegistrationInputSchema,
  RegistrationResponse,
} from "@/schemas/officer.schema";
import { OfficerController } from "@/controllers/officer.controller";

export async function register(
  formData: FormData
): Promise<RegistrationResponse> {
  const validatedData = RegistrationInputSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!validatedData.success) {
    return { success: false, error: "Invalid input data" };
  }

  const controller = new OfficerController();
  const isDuplicate = await controller.checkDuplicates(validatedData.data);

  if (isDuplicate.isExisting) {
    return { success: false, error: "Username exists" };
  }

  return await controller.createOfficer(validatedData.data);
}

export async function login(formData: FormData): Promise<LoginResponse> {
  const validatedData = LoginInputSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!validatedData.success) {
    return { success: false, error: "Invalid input data" };
  }

  const controller = new OfficerController();
  return await controller.retrieveOfficer(validatedData.data);
}