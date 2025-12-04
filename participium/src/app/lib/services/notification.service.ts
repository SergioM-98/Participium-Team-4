import { NotificationsRepository } from "@/repositories/notifications.repository";
import { NotificationsData, NotificationsResponse } from "@/dtos/notificationPreferences.dto";
import { prisma } from "@/prisma/db";
import { Prisma, PrismaClient } from "@prisma/client";

type DBClient = PrismaClient | Prisma.TransactionClient;

class NotificationService {
  private static instance: NotificationService;
  private readonly notificationsRepository: NotificationsRepository;

  private constructor() {
    this.notificationsRepository = NotificationsRepository.getInstance();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // ==================== Notification methods ====================
  public async notifyStatusChange(
    recipientId: string,
    reportId: bigint,
    newStatus: string
  ) {
    return this.notificationsRepository.createNotification({
      type: "STATUS_CHANGE",
      message: `Your report status has been updated to: ${newStatus}`,
      recipientId,
      reportId,
    });
  }

  public async notifyNewMessage(
    recipientId: string,
    reportId: bigint,
    senderName: string
  ) {
    return this.notificationsRepository.createNotification({
      type: "NEW_MESSAGE",
      message: `${senderName} sent you a new message on your report`,
      recipientId,
      reportId,
    });
  }

  public async getUserNotifications(userId: string) {
    return this.notificationsRepository.getNotificationsByUser(userId);
  }

  public async getUnreadNotifications(userId: string) {
    return this.notificationsRepository.getUnreadNotificationsByUser(userId);
  }

  public async markNotificationAsRead(notificationId: bigint) {
    return this.notificationsRepository.markAsRead(notificationId);
  }

  public async markAllNotificationsAsRead(userId: string) {
    return this.notificationsRepository.markAllAsRead(userId);
  }

  // ==================== Notification Preferences methods ====================
  public async getNotificationsPreferences(userId: string): Promise<NotificationsResponse> {
    return this.notificationsRepository.retrieveNotificationsPreferences(userId);
  }

  public async updateNotificationsPreferences(
    userId: string,
    notifications: NotificationsData,
    db: DBClient = prisma
  ): Promise<NotificationsResponse> {
    return this.notificationsRepository.updateNotificationsPreferences(userId, notifications, db);
  }
}

export { NotificationService };