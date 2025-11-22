import { ReportRegistrationResponse } from "../dtos/report.dto";
import { prisma } from "@/prisma/db";

class TelegramBotRepository {
    private static instance: TelegramBotRepository;

    private constructor() {}

    public static getInstance(): TelegramBotRepository {
        if (!TelegramBotRepository.instance) {
            TelegramBotRepository.instance = new TelegramBotRepository();
        }
        return TelegramBotRepository.instance;
    }

    async registerTelegram(token: string, telegramId: number): Promise<ReportRegistrationResponse> {
        const user = await prisma.user.findUnique({
            where: { telegram: token }
        });

        if (!user) {
            return {
                success: false,
                error: "No user found with the provided telegram token."
            }
        }
        
        if(user.telegramRequestPending === false){
            return {
                success: false,
                error: "No pending telegram registration request for this user."
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                telegram: telegramId.toString(),
                telegramRequestPending: false
            }
        });

        if(!updatedUser){
            return {
                success: false,
                error: "Failed to update user with telegram ID."
            }
        }

        return {
            success: true,
            data: "Telegram registered successfully."
        };

    }

    async startTelegramRegistration(userId: string, token: string): Promise<ReportRegistrationResponse> {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                telegram: token,
                telegramRequestPending: true
            }
        });
        if(!updatedUser){
            return {
                success: false,
                error: "Failed to start telegram registration."
            }
        }
        return {
            success: true,
            data: token
        }
    }


}

export { TelegramBotRepository };