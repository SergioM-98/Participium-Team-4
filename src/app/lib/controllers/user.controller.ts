"use server";
import {
  LoginInput,
  LoginResponse,
  MeType,
  RegistrationInput,
  RegistrationInputSchema,
  RegistrationResponse,
} from "@/app/lib/dtos/user.dto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { UserService } from "../services/user.service";
import { updateNotificationsPreferences } from "./notifications.controller";
import { NotificationsData, NotificationsResponse } from "../dtos/notificationPreferences.dto";
import { NotificationsService } from "../services/notifications.service";



  export async function checkDuplicates(userData: RegistrationInput) {
    return await UserService.getInstance().checkDuplicates(userData);
  }

  export async function register(
    formData: FormData
  ): Promise<RegistrationResponse> {
    const session = await getServerSession(authOptions);

    const validatedData = RegistrationInputSchema.safeParse({
      id:  crypto.randomUUID(),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email") || undefined,
      username: formData.get("username"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      role: formData.get("role"),
      office: formData.get("office") || undefined,
    });

    if (!validatedData.success) {
      return { success: false, error: "Invalid input data" };
    }

    if (session || (!session && validatedData.data?.role !== "CITIZEN")) {
      if (!session || session.user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized registration" };
      }
    }

    const isDuplicate = await checkDuplicates(validatedData.data);

    if (isDuplicate.isExisting) {
      return { success: false, error: "Username and/or email already used" };
    }

    const parsed = RegistrationInputSchema.safeParse(validatedData.data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.message };
    }

    return await UserService.getInstance().createUser(parsed.data);
  }

  export async function retrieveUser(userData: LoginInput): Promise<LoginResponse> {
    return await UserService.getInstance().retrieveUser(userData);
  }

  export async function updateNotificationsMedia(telegram: string | null, email: string | null, removeTelegram:boolean, notifications: NotificationsData): Promise<RegistrationResponse> {

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id || session.user?.role !== "CITIZEN") {
      return { success: false, error: "Unauthorized access" };
    }

    if(removeTelegram && notifications.telegramEnabled){
        return { success: false, error: "Cannot enable telegram notifications when removing telegram media" };
    }


    //need to connect the transaction!!!!
    const updateMediaResponse = await UserService.getInstance().updateNotificationsMedia(session.user.id, email, removeTelegram);

    const notificationsResponse = await updateNotificationsPreferences(notifications);

    if(!notificationsResponse.success){
      return { success: false, error: notificationsResponse.error ?? "Failed to update notification preferences" };
    }else{
      return updateMediaResponse;
    }
  }

export async function getMe(): Promise<MeType | RegistrationResponse> {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return { success: false, error: "Unauthorized access" };
    }

    let notifications: NotificationsResponse;

    if(session.user.role === "CITIZEN"){
      notifications = await NotificationsService.getInstance().getNotificationsPreferences(session.user.id);
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
      office: session.user.office as MeType["office"] ?? undefined,
      telegram: session.user.telegram ?? undefined,
    };
  }