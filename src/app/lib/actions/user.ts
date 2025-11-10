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
  console.log("formData received in register action:", formData);
  const validatedData = RegistrationInputSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email") ?? undefined,
    username: formData.get("username"),
    password: formData.get("password"),
    role: formData.get("role"),
    office: formData.get("office") ?? undefined,
    telegram: formData.get("telegram") ?? undefined
  });

  if((!session || session.user.role !== "ADMIN") && validatedData.data?.role !== "CITIZEN"){
    return { success: false, error: "Unauthorized registration" };
  }

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

