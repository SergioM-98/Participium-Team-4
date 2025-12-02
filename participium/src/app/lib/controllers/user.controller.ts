"use server";
import {
  LoginInput,
  LoginResponse,
  MeType,
  RegistrationInput,
  RegistrationInputSchema,
  RegistrationResponse,
} from "../dtos/user.dto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth";
import { UserService } from "../services/user.service";
import { updateNotificationsPreferences } from "./notification.controller";
import { NotificationsData, NotificationsResponse } from "../dtos/notificationPreferences.dto";
import { NotificationService } from "../services/notification.service";
import { prisma } from "@/prisma/db";



export async function checkDuplicates(userData: RegistrationInput) {
  try {
    return await UserService.getInstance().checkDuplicates(userData);
  } catch (error) {
    console.error("Error checking duplicates:", error);
    throw error;
  }
}

export async function register(
  formData: FormData
): Promise<RegistrationResponse> {

  
  const session = await getServerSession(authOptions);

  const validatedData = RegistrationInputSchema.safeParse({
    id: crypto.randomUUID(),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email") || undefined,
    username: formData.get("username"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role"),
    office: formData.get("office")?.toString().trim() || undefined,
  });

  if (!validatedData.success) {
    console.error("Validation errors:", validatedData.error);
    // Zod error format
    const errorMessages = validatedData.error.issues?.length 
      ? validatedData.error.issues.map((issue: any) => `${issue.path?.join('.') || 'unknown'} - ${issue.message}`).join('; ')
      : "Invalid input data";
    return { success: false, error: errorMessages };
  }

  if (session || (!session && validatedData.data?.role !== "CITIZEN")) {
    if (session?.user.role !== "ADMIN") {
      console.error("Unauthorized registration attempt by user:", session?.user.username);
      return { success: false, error: "Unauthorized registration" };
    }
  }
  try {
    const isDuplicate = await checkDuplicates(validatedData.data);
    if (isDuplicate.isExisting) {
      return { success: false, error: "Username and/or email already used" };
    }
  } catch (error) {
    console.error("Error during duplicate check:", error);
    return { success: false, error: "Failed to check for duplicates" };
  }

  const parsed = RegistrationInputSchema.safeParse(validatedData.data);
  if (!parsed.success) {
    console.error("Parsed validation errors:", parsed.error);
    return { success: false, error: parsed.error.message };
  }

  try {
    return await UserService.getInstance().createUser(parsed.data);
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Failed to create user" };
  }
}

export async function retrieveUser(
  userData: LoginInput
): Promise<LoginResponse> {
  try {
    return await UserService.getInstance().retrieveUser(userData);
  } catch (error) {
    console.error("Error retrieving user:", error);
    return { success: false, error: "Failed to retrieve user" };
  }
}

export async function updateNotificationsMedia(
  email: string | null,
  removeTelegram: boolean,
  notifications: NotificationsData
): Promise<RegistrationResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user?.role !== "CITIZEN") {
    console.error("Unauthorized access attempt to update notifications media by user:", session?.user?.username);
    return { success: false, error: "Unauthorized access" };
  }

  if (removeTelegram && notifications.telegramEnabled) {
    return {
      success: false,
      error:
        "Cannot enable telegram notifications when removing telegram media",
    };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const updateMediaResponse =
        await UserService.getInstance().updateNotificationsMedia(
          session.user.id,
          email,
          removeTelegram,
          tx
        );

      const notificationsResponse = await updateNotificationsPreferences(
        notifications,
        tx
      );
      if (notificationsResponse.success) {
        return updateMediaResponse;
      } else {
        console.error("Failed to update notification preferences for user:", session?.user?.username);
        throw new Error(notificationsResponse.error ?? "Failed to update notification preferences");
      }
    });
  } catch (error) {
    console.error("Error updating notifications media or preferences:", error);
    return { success: false, error: "Failed to update notifications" };
  }
}

export async function getMe(): Promise<MeType | RegistrationResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error("Unauthorized access attempt to get user info");
    return { success: false, error: "Unauthorized access" };
  }

  let notifications: NotificationsResponse;

    if(session.user.role === "CITIZEN"){
      try {
        notifications = await NotificationService.getInstance().getNotificationsPreferences(session.user.username);
      } catch (error) {
        console.error("Error retrieving notification preferences:", error);
        return { success: false, error: "Failed to retrieve notification preferences" };
      }
      if(!notifications.success){
        return { success: false, error: notifications.error ?? "Failed to retrieve notification preferences" };
      } 
    }

  return {
    id: session.user.id,
    firstName: session.user.firstName,
    lastName: session.user.lastName,
    email: session.user.email ?? undefined,
    username: session.user.username,
    role: session.user.role as MeType["role"],
    office: (session.user.office as MeType["office"]) ?? undefined,
    telegram: session.user.telegram ?? undefined,
  };
}
