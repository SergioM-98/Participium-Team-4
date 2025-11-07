"use server";

import { signIn, auth } from "@/app/auth";
import {
  LoginInputSchema,
  LoginResponse,
  RegistrationInputSchema,
  RegistrationResponse,
} from "@/app/lib/dtos/user.dto";
import { UserController } from "@/controllers/user.controller";

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
    const firstError = validatedData.error.message ?? "Invalid input data";
    return { success: false, error: firstError };
  }

  try {
    const result = await signIn("credentials", {
      username: validatedData.data.username,
      password: validatedData.data.password,
      redirect: false,
    });

    if (!result || result.error) {
      return { success: false, error: "Invalid credentials" };
    }
    
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Failed to retrieve user session" };
    }

    return {
      success: true,
      data: {
        id: BigInt(session.user.id),
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        username: session.user.name,
        email: session.user.email,
        role: session.user.role,
        office: session.user.office,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Internal server error" };
  }
}
