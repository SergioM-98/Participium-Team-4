import { NotificationsRepository } from "@/repositories/notifications.repository";
import { NotificationsData, NotificationsResponse } from "../dtos/notificationPreferences.dto";

class NotificationService {
  private static instance: NotificationService;
  private notificationsRepository: NotificationsRepository;

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
    recipientId: bigint,
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
    recipientId: bigint,
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

  public async getUserNotifications(userId: bigint) {
    return this.notificationsRepository.getNotificationsByUser(userId);
  }

  public async getUnreadNotifications(userId: bigint) {
    return this.notificationsRepository.getUnreadNotificationsByUser(userId);
  }

  public async markNotificationAsRead(notificationId: bigint) {
    return this.notificationsRepository.markAsRead(notificationId);
  }

  public async markAllNotificationsAsRead(userId: bigint) {
    return this.notificationsRepository.markAllAsRead(userId);
  }

  // ==================== Notification Preferences methods ====================
  public async getNotificationsPreferences(userId: number | string): Promise<NotificationsResponse> {
    return this.notificationsRepository.retrieveNotificationsPreferences(userId);
  }

  public async updateNotificationsPreferences(
    userId: number | string,
    notifications: NotificationsData
  ): Promise<NotificationsResponse> {
    return this.notificationsRepository.updateNotificationsPreferences(userId, notifications);
  }
}

export { NotificationService };