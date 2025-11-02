"use server";

import {
  LoginInputSchema,
  LoginResponse,
  RegistrationInputSchema,
  RegistrationResponse,
} from "@/app/lib/dtos/citizen.schema";
import { CitizenController } from "@/controllers/citizen.controller";
import { createSession } from "@/services/session";

export async function register(
  formData: FormData
): Promise<RegistrationResponse> {
  const validatedData = RegistrationInputSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!validatedData.success) {
    return { success: false, error: "Invalid input data" };
  }

  const controller = new CitizenController();
  const isDuplicate = await controller.checkDuplicates(validatedData.data);

  if (isDuplicate.isExisting) {
    return { success: false, error: "Username or email already exists" };
  }

  return await controller.createCitizen(validatedData.data);
}

export async function login(formData: FormData): Promise<LoginResponse> {
  const validatedData = LoginInputSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedData.success) {
    return { success: false, error: "Invalid input data" };
  }

  const controller = new CitizenController();
  const response = await controller.retrieveCitizen(validatedData.data);

  if (response.success && response.data) {
    await createSession(response.data.id);
  }

  return response;
}
