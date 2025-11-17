"use server";

import { UserRepository } from "@/repositories/user.repository";
import {
  LoginInput,
  LoginResponse,
  RegistrationInput,
  RegistrationInputSchema,
  RegistrationResponse,
} from "@/app/lib/dtos/user.dto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { UserService } from "../services/user.service";
import { NotificationsController } from "./notifications.controller";
import { NotificationsData } from "../dtos/notificationPreferences.dto";


class UserController {
  constructor(
    private userService = UserService.getInstance()
  ) {}


  async checkDuplicates(userData: RegistrationInput) {
    return await this.userService.checkDuplicates(userData);
  }




  
  async register(
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

    const parsed = RegistrationInputSchema.safeParse(validatedData.data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.message };
    }

    return await this.userService.createUser(parsed.data);
  }

  async retrieveUser(userData: LoginInput): Promise<LoginResponse> {
    return await this.userService.retrieveUser(userData);
  }

  async updateNotificationsMedia(telegram: string | null, email: string | null, removeTelegram:boolean, notifications: NotificationsData): Promise<RegistrationResponse> {

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.username || session.user?.role !== "CITIZEN") {
      return { success: false, error: "Unauthorized access" };
    }

    if(removeTelegram && notifications.telegramEnabled){
        return { success: false, error: "Cannot enable telegram notifications when removing telegram media" };
    }

    const updateMediaResponse = await this.userService.updateNotificationsMedia(session.user.username, telegram, email, removeTelegram);

    const notificationsResponse = await new NotificationsController().updateNotificationsPreferences(notifications);

    if(!notificationsResponse.success){
      return { success: false, error: notificationsResponse.error ?? "Failed to update notification preferences" };
    }else{
      return updateMediaResponse;
    }
  }
}

export { UserController };
