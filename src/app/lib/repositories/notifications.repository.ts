"use server";

import { prisma } from "@/prisma/db";
import { NotificationsData, NotificationsResponse } from "../dtos/notificationPreferences.dto";
import { Prisma, PrismaClient } from "@prisma/client";


type DBClient = PrismaClient | Prisma.TransactionClient;
class NotificationsRepository {
    private static instance: NotificationsRepository;

    private constructor() {}

    public static getInstance(): NotificationsRepository {
        if (!NotificationsRepository.instance) {
            NotificationsRepository.instance = new NotificationsRepository();
        }
        return NotificationsRepository.instance;
    }

  async retrieveNotificationsPreferences(userId: string): Promise<NotificationsResponse> {
        try {
            let user;
            
            user = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });
        

            if (!user) {
                return { success: false, error: "Invalid credentials" };
            }

            if(user.role !== "CITIZEN") {
                return { success: false, error: "Only CITIZEN can have notification preferences" };
            }

            const preferences = await prisma.notificationPreferences.findUnique({
                where: {
                    id: user.id,
                },
            });

            if (!preferences) {
                return { success: false, error: "Notification preferences not found" };
            }

            const emailEnabled = preferences.emailEnabled;
            const telegramEnabled = preferences.telegramEnabled;
            return {
                success: true,
                data: {
                    emailEnabled,
                    telegramEnabled,
                },
        }
        } catch (error) {
            return { 
                success: false,
                error: error instanceof Error ? error.message : "Failed to retrieve notification preferences"
            };
        }
    }

    async updateNotificationsPreferences(userId: string, notifications: NotificationsData, db: DBClient = prisma): Promise<NotificationsResponse> {
        try {
            let user;
            user = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });
        

            if (!user) {
                return { success: false, error: "User not found" };
            }

            if(user.role !== "CITIZEN") {
                return { success: false, error: "Only CITIZEN can have notification preferences" };
            }

            if(user.telegram === null && notifications.telegramEnabled){
                return { success: false, error: "Cannot enable telegram notifications without telegram media" };
            }

            const updatedPreferences = await prisma.notificationPreferences.upsert({
                where: {
                    id: user.id,
                },
                update: {
                    emailEnabled: notifications.emailEnabled,
                    telegramEnabled: notifications.telegramEnabled,
                },
                create: {
                    id: user.id,
                    emailEnabled: notifications.emailEnabled,
                    telegramEnabled: notifications.telegramEnabled,
                },
            });

            return {
                success: true,
                data: {
                    emailEnabled: updatedPreferences.emailEnabled,
                    telegramEnabled: updatedPreferences.telegramEnabled,
                },
        };
        } catch (error) {
            return { 
                success: false,
                error: error instanceof Error ? error.message : "Failed to update notification preferences"
            };
        }
    }
}

export { NotificationsRepository };
