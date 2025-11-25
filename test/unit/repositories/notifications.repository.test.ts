import { NotificationsRepository } from "@/repositories/notifications.repository";

jest.mock("@/prisma/db", () => ({
  prisma: {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    notificationPreferences: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

const mockedPrisma = jest.requireMock("@/prisma/db").prisma;

describe("NotificationsRepository story 11", () => {
  let notificationsRepository: NotificationsRepository;

  const mockNotificationData = {
    type: "STATUS_CHANGE" as const,
    message: "Status updated",
    recipientId: BigInt(1),
    reportId: BigInt(100),
  };

  const mockCreatedNotification = {
    id: BigInt(10),
    ...mockNotificationData,
    isRead: false,
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    notificationsRepository = NotificationsRepository.getInstance();
  });


  describe("createNotification", () => {
    it("should create a notification successfully", async () => {
      mockedPrisma.notification.create.mockResolvedValue(mockCreatedNotification);

      const response = await notificationsRepository.createNotification(mockNotificationData);

      expect(mockedPrisma.notification.create).toHaveBeenCalledWith({
        data: mockNotificationData,
      });
      expect(response).toEqual(mockCreatedNotification);
    });
  });

  describe("getNotificationsByUser", () => {
    it("should return notifications for a user", async () => {
      mockedPrisma.notification.findMany.mockResolvedValue([mockCreatedNotification]);

      const response = await notificationsRepository.getNotificationsByUser(BigInt(1));

      expect(mockedPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { recipientId: BigInt(1) },
        orderBy: { createdAt: 'desc' },
        include: { report: true },
      });
      expect(response).toHaveLength(1);
    });
  });

  describe("getUnreadNotificationsByUser", () => {
    it("should return only unread notifications", async () => {
      mockedPrisma.notification.findMany.mockResolvedValue([mockCreatedNotification]);

      const response = await notificationsRepository.getUnreadNotificationsByUser(BigInt(1));

      expect(mockedPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { recipientId: BigInt(1), isRead: false },
        orderBy: { createdAt: 'desc' },
        include: { report: true },
      });
    });
  });

  describe("markAsRead", () => {
    it("should mark a single notification as read", async () => {
      const updatedNotif = { ...mockCreatedNotification, isRead: true };
      mockedPrisma.notification.update.mockResolvedValue(updatedNotif);

      const response = await notificationsRepository.markAsRead(BigInt(10));

      expect(mockedPrisma.notification.update).toHaveBeenCalledWith({
        where: { id: BigInt(10) },
        data: { isRead: true },
      });
      expect(response.isRead).toBe(true);
    });
  });

  describe("markAllAsRead", () => {
    it("should mark all user notifications as read", async () => {
      mockedPrisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const response = await notificationsRepository.markAllAsRead(BigInt(1));

      expect(mockedPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { recipientId: BigInt(1), isRead: false },
        data: { isRead: true },
      });
      expect(response).toEqual({ count: 5 });
    });
  });
});