"use server";
import { NotificationService } from "@/services/notification.service";
import { NotificationsData, NotificationsResponse } from "@/dtos/notificationPreferences.dto";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/prisma/db";
import { Prisma, PrismaClient } from "@prisma/client";

type DBClient = PrismaClient | Prisma.TransactionClient;
const notificationService = NotificationService.getInstance();


// ==================== Notification methods ====================
export async function getInbox() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const notifications = await notificationService.getUserNotifications(
      session.user.id
    );
    return { success: true, data: notifications };
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    return { success: false, error: "Failed to retrieve notifications" };
  }
}

export async function getUnreadCount() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const unread = await notificationService.getUnreadNotifications(
      session.user.id
    );
    return { success: true, data: unread.length };
  } catch (error) {
    console.error("Error retrieving unread notifications count:", error);
    return { success: false, error: "Failed to retrieve unread count" };
  }
}

export async function markAsRead(notificationId: bigint) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await notificationService.markNotificationAsRead(notificationId);
    return { success: true, message: "Notification marked as read" };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

export async function markAllAsRead() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await notificationService.markAllNotificationsAsRead(session.user.id);
    return { success: true, message: "All notifications marked as read" };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error: "Failed to mark all notifications as read" };
  }
}

// ==================== Notification Preferences methods ====================
export async function getNotificationsPreferences(): Promise<NotificationsResponse> {
  const userRoleCheck = await checkUserRole();
  if (!userRoleCheck.success || !userRoleCheck.data) {
    return { success: false, error: "Unauthorized access" };
  }
  try{
    return await notificationService.getNotificationsPreferences(userRoleCheck.data);
  } catch (error) {
    console.error("Error retrieving notification preferences:", error);
    return { success: false, error: "Failed to retrieve notification preferences" };
  }
}

export async function updateNotificationsPreferences(
  notifications: NotificationsData,
  db: DBClient = prisma
): Promise<NotificationsResponse> {
  const userRoleCheck = await checkUserRole();
  if (!userRoleCheck.success || !userRoleCheck.data) {
    return { success: false, error: "Unauthorized access" };
  }
  try{
    return await notificationService.updateNotificationsPreferences(userRoleCheck.data, notifications, db);
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return { success: false, error: "Failed to update notification preferences" };
  }
}

async function checkUserRole(): Promise<{
  success: boolean;
  data?: string;
}> {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "CITIZEN") {
    return {
      success: false,
    };
  }
  return {
    success: true,
    data: session.user.username,
  };
}
