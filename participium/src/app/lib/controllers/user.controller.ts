"use server";
import {
  LoginInput,
  LoginResponse,
  MeType,
  RegistrationInput,
  RegistrationInputSchema,
  RegistrationResponse,
} from "@/dtos/user.dto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth";
import { UserService } from "@/services/user.service";
import { updateNotificationsPreferences } from "./notification.controller";
import {
  NotificationsData,
  NotificationsResponse,
} from "@/dtos/notificationPreferences.dto";
import { NotificationService } from "@/services/notification.service";
import { prisma } from "@/prisma/db";
import { no } from "zod/v4/locales";



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
    companyId: formData.get("companyId")?.toString().trim() || undefined,
  });

  if (!validatedData.success) {
    console.error("Validation errors:", validatedData.error);
    const errorMessages = validatedData.error.issues?.length
      ? validatedData.error.issues
          .map(
            (issue: any) =>
              `${issue.path?.join(".") || "unknown"} - ${issue.message}`
          )
          .join("; ")
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
    const result = await UserService.getInstance().createUser(parsed.data);

    // For CITIZEN users, registration is complete but verification is pending
    if (result.success && parsed.data.role === "CITIZEN") {
      return {
        success: true,
        data: parsed.data.username,
        pendingVerification: true,
      };
    }
    return result;
  }catch (error) {
    console.error("Error during user registration:", error);
    return { success: false, error: "Failed to register user" };
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
        console.error(notificationsResponse.error ?? "Failed to update notification preferences for user:", session?.user?.username);
        throw new Error("Failed to update notification preferences");
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
  let emailEnabled = false;
  let telegramEnabled = false;
  if(session.user.role === "CITIZEN"){
    try {
      notifications = await NotificationService.getInstance().getNotificationsPreferences(session.user.username);
    } catch (error) {
      console.error("Error retrieving notification preferences:", error);
      return { success: false, error: "Failed to retrieve notification preferences" };
    }
    if(notifications.success){
      emailEnabled = notifications.data.emailEnabled;
      telegramEnabled = notifications.data.telegramEnabled ?? false;
    }else{
      return { success: false, error: notifications.error ?? "Failed to retrieve notification preferences" };
    } 
  }
  let user;
  try{
    user = await UserService.getInstance().getMe(session.user.id);
  }catch(error){
    console.error(error instanceof Error ? error.message : "failed to get the personal informations from the database");
    return {
      success: false,
      error: "failed to get the personal informations from the database"
    }
  }
  if(user===null){
    console.error("The user does not exist on the database");
    return {
      success: false,
      error: "User not found"
    }
  }
  
  return {
    me:{
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email ?? undefined,
      username: user.username,
      role: user.role as MeType["me"]["role"],
      office: (user.office as MeType["me"]["office"]) ?? undefined,
      telegram: !!user.telegramChatId,
      companyId: companyId ?? undefined,
      companyName: companyName ?? undefined,
    },
    emailNotifications: emailEnabled,
    telegramNotifications: telegramEnabled
  };
}
