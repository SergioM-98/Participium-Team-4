"use server";

import {
  LoginInputSchema,
  LoginResponse,
  RegistrationInputSchema,
  RegistrationResponse,
} from "@/app/lib/dtos/user.dto";
import { UserController } from "@/controllers/user.controller";
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

  const controller = new UserController();
  const isDuplicate = await controller.checkDuplicates(validatedData.data);

  if (isDuplicate.isExisting) {
    return { success: false, error: "Username exists" };
  }

  return await controller.createUser(validatedData.data);
}

export async function login(formData: FormData): Promise<LoginResponse> {
  const validatedData = LoginInputSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!validatedData.success) {
    return { success: false, error: "Invalid input data" };
  }

  const controller = new UserController();
  const response = await controller.retrieveUser(validatedData.data);

  if (response.success && response.data) {
    signIn("credentials", { redirect: false, ... })
  }

  return response;
}
