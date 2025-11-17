"use server";

import { prisma } from "@/prisma/db";
import { NotificationsData, NotificationsResponse } from "../dtos/notificationPreferences.dto";

class NotificationsRepository {
    private static instance: NotificationsRepository;

    private constructor() {}

    public static getInstance(): NotificationsRepository {
        if (!NotificationsRepository.instance) {
            NotificationsRepository.instance = new NotificationsRepository();
        }
        return NotificationsRepository.instance;
    }

  async retrieveNotificationsPreferences(userId: number | string): Promise<NotificationsResponse> {
        try {
            let user;
            if(typeof userId === "number") {
                user = await prisma.user.findUnique({
                    where: {
                        id: userId,
                    },
                });
            } else {
                user = await prisma.user.findUnique({
                    where: {
                        username: userId,
                    },
                });
            }

            if (!user) {
                return { success: false, error: "Invalid credentials" };
            }

            if(user.role !== "CITIZEN") {
                return { success: false, error: "Only CITIZEN can have notification preferences" };
            }

            const preferences = await prisma.notifications_preferences.findUnique({
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
            throw new Error("Failed to fetch user from database");
        }
    }

    async updateNotificationsPreferences(userId: number | string, notifications: NotificationsData): Promise<NotificationsResponse> {
        try {
            let user;
            if(typeof userId === "number") {
                user = await prisma.user.findUnique({
                    where: {
                        id: userId,
                    },
                });
            } else {
                user = await prisma.user.findUnique({
                    where: {
                        username: userId,
                    },
                });
            }

            if (!user) {
                return { success: false, error: "User not found" };
            }

            if(user.role !== "CITIZEN") {
                return { success: false, error: "Only CITIZEN can have notification preferences" };
            }

            if(user.telegram === null && notifications.telegramEnabled){
                return { success: false, error: "Cannot enable telegram notifications without telegram media" };
            }

            const updatedPreferences = await prisma.notifications_preferences.update({
                where: {
                    id: user.id,
                },
                data: {
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
            throw new Error("Failed to update notification preferences");
        }
    }
}

export { NotificationsRepository };
