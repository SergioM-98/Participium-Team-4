"use server";

import { prisma } from "@/prisma/db";
import type { Notification } from "@prisma/client";
import { NotificationsData, NotificationsResponse } from "../dtos/notificationPreferences.dto";
import { Prisma, PrismaClient } from "@prisma/client";

type DBClient = PrismaClient | Prisma.TransactionClient;

class NotificationsRepository {
    private static instance: NotificationsRepository;

    private constructor() { }

    public static getInstance(): NotificationsRepository {
        if (!NotificationsRepository.instance) {
            NotificationsRepository.instance = new NotificationsRepository();
        }
        return NotificationsRepository.instance;
    }

    public async createNotification(data: {
        type: "STATUS_CHANGE" | "NEW_MESSAGE";
        message: string;
        recipientId: bigint;
        reportId: bigint;
    }): Promise<Notification> {
        return prisma.notification.create({ data });
    }

    public async getNotificationsByUser(userId: bigint): Promise<Notification[]> {
        return prisma.notification.findMany({
            where: { recipientId: userId },
            orderBy: { createdAt: 'desc' },
            include: { report: true },
        });
    }

    public async getUnreadNotificationsByUser(userId: bigint): Promise<Notification[]> {
        return prisma.notification.findMany({
            where: { recipientId: userId, isRead: false },
            orderBy: { createdAt: 'desc' },
            include: { report: true },
        });
    }

    public async markAsRead(notificationId: bigint): Promise<Notification> {
        return prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }

    public async markAllAsRead(userId: bigint) {
        return prisma.notification.updateMany({
            where: { recipientId: userId, isRead: false },
            data: { isRead: true },
        });
    }

    async retrieveNotificationsPreferences(userId: number | string): Promise<NotificationsResponse> {
        try {
            let user;
            if (typeof userId === "number") {
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

            if (user.role !== "CITIZEN") {
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
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to retrieve notification preferences",
            };
        }
    }

    async updateNotificationsPreferences(
        userId: number | string,
        notifications: NotificationsData,
        db: DBClient = prisma
    ): Promise<NotificationsResponse> {
        try {
            let user;
            if (typeof userId === "number") {
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

            if (user.role !== "CITIZEN") {
                return { success: false, error: "Only CITIZEN can have notification preferences" };
            }

            if (user.telegram === null && notifications.telegramEnabled) {
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
                error: error instanceof Error ? error.message : "Failed to update notification preferences",
            };
        }
    }
}

export { NotificationsRepository };
