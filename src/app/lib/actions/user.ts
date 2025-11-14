"use server";

import {
  RegistrationInputSchema,
  RegistrationResponse,
} from "@/app/lib/dtos/user.dto";
import { UserController } from "@/controllers/user.controller";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

export async function register(
  formData: FormData
): Promise<RegistrationResponse> {
  const session = await getServerSession(authOptions);

  const validatedData = RegistrationInputSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email") || undefined,
    username: formData.get("username"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role"),
    office: formData.get("office") || undefined,
    telegram: formData.get("telegram") || undefined,
  });

  if (!validatedData.success) {
    return { success: false, error: "Invalid input data" };
  }

  if (session || (!session && validatedData.data?.role !== "CITIZEN")) {
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized registration" };
    }
  }

  const controller = new UserController();
  const isDuplicate = await controller.checkDuplicates(validatedData.data);

  if (isDuplicate.isExisting) {
    return { success: false, error: "Username and/or email already used" };
  }

  return await controller.createUser(validatedData.data);
}
