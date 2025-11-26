import { NotificationService } from "../../../src/app/lib/services/notification.service";
import { NotificationsRepository } from "../../../src/app/lib/repositories/notifications.repository";

jest.mock("@/app/lib/repositories/notifications.repository", () => ({
  NotificationsRepository: {
    getInstance: jest.fn(),
  },
}));

describe("NotificationService story 11", () => {
  let notificationService: NotificationService;
  
  const mockRepo = {
    createNotification: jest.fn(),
    getNotificationsByUser: jest.fn(),
    getUnreadNotificationsByUser: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    retrieveNotificationsPreferences: jest.fn(),
    updateNotificationsPreferences: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (NotificationsRepository.getInstance as jest.Mock).mockReturnValue(mockRepo);
    notificationService = NotificationService.getInstance();
  });

  describe("notifyStatusChange", () => {
    it("should create a STATUS_CHANGE notification", async () => {
      const recipientId = BigInt(1);
      const reportId = BigInt(100);
      const status = "RESOLVED";

      await notificationService.notifyStatusChange(recipientId, reportId, status);

      expect(mockRepo.createNotification).toHaveBeenCalledWith({
        type: "STATUS_CHANGE",
        message: `Your report status has been updated to: ${status}`,
        recipientId,
        reportId,
      });
    });
  });

  describe("notifyNewMessage", () => {
    it("should create a NEW_MESSAGE notification", async () => {
      const recipientId = BigInt(1);
      const reportId = BigInt(100);
      const senderName = "Officer John";

      await notificationService.notifyNewMessage(recipientId, reportId, senderName);

      expect(mockRepo.createNotification).toHaveBeenCalledWith({
        type: "NEW_MESSAGE",
        message: `${senderName} sent you a new message on your report`,
        recipientId,
        reportId,
      });
    });
  });

  describe("getters and markers", () => {
    it("getUserNotifications should call repository", async () => {
      await notificationService.getUserNotifications(BigInt(1));
      expect(mockRepo.getNotificationsByUser).toHaveBeenCalledWith(BigInt(1));
    });

    it("getUnreadNotifications should call repository", async () => {
      await notificationService.getUnreadNotifications(BigInt(1));
      expect(mockRepo.getUnreadNotificationsByUser).toHaveBeenCalledWith(BigInt(1));
    });

    it("markNotificationAsRead should call repository", async () => {
      await notificationService.markNotificationAsRead(BigInt(10));
      expect(mockRepo.markAsRead).toHaveBeenCalledWith(BigInt(10));
    });

    it("markAllNotificationsAsRead should call repository", async () => {
      await notificationService.markAllNotificationsAsRead(BigInt(1));
      expect(mockRepo.markAllAsRead).toHaveBeenCalledWith(BigInt(1));
    });
  });

  describe("Preferences", () => {
    it("should retrieve preferences", async () => {
      await notificationService.getNotificationsPreferences("testuser");
      expect(mockRepo.retrieveNotificationsPreferences).toHaveBeenCalledWith("testuser");
    });

    it("should update preferences", async () => {
      const prefs = { emailEnabled: true, telegramEnabled: false };
      await notificationService.updateNotificationsPreferences("testuser", prefs);
      expect(mockRepo.updateNotificationsPreferences).toHaveBeenCalledWith("testuser", prefs);
    });
  });
});