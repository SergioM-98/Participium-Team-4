"use server";
import { RegistrationResponse } from "../dtos/user.dto";
import { TelegramService } from "../services/telegramBot.service";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { ReportCategoryType, ReportRegistrationResponse, reportRequestSchema } from "../dtos/report.dto";
import { TelegramAPIReportRequest } from "../dtos/telegramBot.dto";
import { UserService } from "../services/user.service";
import { createUploadPhoto } from "./uploader.controller";
import { ControllerSuccessResponse } from "../dtos/tus.dto";
import { ReportCreationService } from "../services/reportCreation.service";

export async function registerTelegramReport(report: TelegramAPIReportRequest, photos: File[]): Promise<ReportRegistrationResponse> {
    const userService = UserService.getInstance();

    const username = await userService.getUserByTelegramId(report.chatId.toString());

    if (!username.success) {
        return {
            success: false,
            error: "User not found for the given Chat ID."
        };
    }
    const locations: string[] = [];

    photos.forEach(async (photo) => {
        const result = await uploadPhoto(photo);
        if (!result.success) {
            return {
                success: false,
                error: "Photo upload failed."
            };
        }else{
            locations.push(result.location!);
        }
    });

    const reportService = ReportCreationService.getInstance();

    const reportData = {
            title: report.title,
            description: report.description,
            photos: locations,
            category: report.category as ReportCategoryType,
            longitude: parseFloat(report.longitude),
            latitude: parseFloat(report.latitude),
            userId: report.isAnonymous? "2" : username.data,
            isAnonymous: report.isAnonymous
        };
    
    const registrationResult = reportService.createReport(reportData);

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

export async function registerTelegram(token: string, telegramId: number): Promise<RegistrationResponse> {
    const telegramService = TelegramService.getInstance();
    return telegramService.registerTelegram(token, telegramId);
}

export async function startTelegramRegistration(): Promise<RegistrationResponse> {
    const token = crypto.randomUUID();
    const session = await getServerSession(authOptions);
    if(!session || !session.user || !session.user.id){
        return{
            success: false,
            error: "Authentication failed"
        }
    }
    const telegramService = TelegramService.getInstance();
    return telegramService.startTelegramRegistration(session?.user?.id, token);
}