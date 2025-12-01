"use server";
import { RegistrationResponse } from "../dtos/user.dto";
import { TelegramService } from "../services/telegramBot.service";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth";
import { Category, ReportRegistrationResponse } from "../dtos/report.dto";
import {
  TelegramAPIReportRequest,
  UserAuthenticationResponse,
} from "../dtos/telegramBot.dto";
import { UserService } from "../services/user.service";
import { createUploadPhoto } from "./uploader.controller";
import { ControllerSuccessResponse } from "../dtos/tus.dto";
import { ReportCreationService } from "../services/reportCreation.service";

export async function registerTelegramReport(
  report: TelegramAPIReportRequest,
  photos: File[]
): Promise<ReportRegistrationResponse> {
  console.log("[registerTelegramReport] Starting with report:", report);
  console.log("[registerTelegramReport] Photos count:", photos.length);

  const userService = UserService.getInstance();

  console.log(
    "[registerTelegramReport] Getting user by telegram ID:",
    report.chatId
  );
  const username = await userService.getUserByTelegramId(
    report.chatId.toString()
  );

  console.log("[registerTelegramReport] User lookup result:", username);

  if (!username.success) {
    return {
      success: false,
      error: "User not found for the given Chat ID.",
    };
  }

  const locations: string[] = [];

  console.log("[registerTelegramReport] Starting photo uploads");
  // Upload photos sequentially and wait for each to complete
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    console.log(
      `[registerTelegramReport] Uploading photo ${i + 1}/${
        photos.length
      }, size: ${photo.size}`
    );
    const result = await uploadPhoto(photo);
    console.log(
      `[registerTelegramReport] Photo ${i + 1} upload result:`,
      result
    );
    if (!result.success) {
      return {
        success: false,
        error: "Photo upload failed.",
      };
    }
    locations.push(result.location!);
  }

  console.log(
    "[registerTelegramReport] All photos uploaded, locations:",
    locations
  );

  const reportService = ReportCreationService.getInstance();

  const reportData = {
    title: report.title,
    description: report.description,
    photos: locations,
    category: report.category as Category,
    longitude: Number.parseFloat(report.longitude),
    latitude: Number.parseFloat(report.latitude),
    userId: report.isAnonymous ? "2" : username.data,
    isAnonymous: report.isAnonymous,
  };

  console.log(
    "[registerTelegramReport] Creating report with data:",
    reportData
  );
  const registrationResult = await reportService.createReport(reportData);
  console.log(
    "[registerTelegramReport] Report creation result:",
    registrationResult
  );

  return registrationResult;
}

async function uploadPhoto(photo: File): Promise<ControllerSuccessResponse> {
  const formData = new FormData();

  formData.append("tus-resumable", "1.0.0");
  formData.append("upload-length", photo.size.toString());
  formData.append("upload-metadata", `filename ${btoa(photo.name)}`);
  formData.append("file", photo);

  const result = await createUploadPhoto(formData);
  return result;
}

export async function registerTelegram(
  token: string,
  telegramId: number
): Promise<RegistrationResponse> {
  const telegramService = TelegramService.getInstance();
  return telegramService.registerTelegram(token, telegramId);
}

export async function startTelegramRegistration(): Promise<RegistrationResponse> {
  const token = crypto.randomUUID();
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return {
      success: false,
      error: "Authentication failed",
    };
  }
  const telegramService = TelegramService.getInstance();
  return telegramService.startTelegramRegistration(session?.user?.id, token);
}

export async function isUserAuthenticatedByTelegram(
  chatId: number
): Promise<UserAuthenticationResponse> {
  const telegramService = TelegramService.getInstance();
  return telegramService.isAuthenticated(chatId);
}
