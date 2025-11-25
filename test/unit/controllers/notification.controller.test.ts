import { NotificationService } from '@/services/notification.service';
import { 
  getInbox, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead, 
  getNotificationsPreferences, 
  updateNotificationsPreferences 
} from '@/controllers/notification.controller';
import { getServerSession } from "next-auth/next";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

jest.mock('@/services/notification.service', () => {
  const mockNotificationServiceInstance = {
    getUserNotifications: jest.fn(),
    getUnreadNotifications: jest.fn(),
    markNotificationAsRead: jest.fn(),
    markAllNotificationsAsRead: jest.fn(),
    getNotificationsPreferences: jest.fn(),
    updateNotificationsPreferences: jest.fn(),
  };

  return {
    NotificationService: {
      getInstance: jest.fn(() => mockNotificationServiceInstance),
    },
  };
});

const mockNotificationService = jest.mocked(NotificationService);
const mockInstance = mockNotificationService.getInstance() as jest.Mocked<{
  getUserNotifications: jest.MockedFunction<any>;
  getUnreadNotifications: jest.MockedFunction<any>;
  markNotificationAsRead: jest.MockedFunction<any>;
  markAllNotificationsAsRead: jest.MockedFunction<any>;
  getNotificationsPreferences: jest.MockedFunction<any>;
  updateNotificationsPreferences: jest.MockedFunction<any>;
}>;

describe('NotificationController story 11', () => {
    const mockSession = {
        user: {
            id: "1",
            username: "testuser",
            role: "CITIZEN",
        },
    };

    const mockOfficerSession = {
        user: {
            id: "2",
            username: "officer",
            role: "OFFICER",
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getInbox', () => {
        it('should retrieve user notifications successfully', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(mockSession);
            const mockNotifications = [
                { id: 1, message: 'Test notification', isRead: false }
            ];

            mockInstance.getUserNotifications.mockResolvedValue(mockNotifications);

            const response = await getInbox();

            expect(mockNotificationService.getInstance().getUserNotifications).toHaveBeenCalled();
            expect(mockInstance.getUserNotifications).toHaveBeenCalledWith(BigInt(1));
            expect(response).toEqual({ success: true, data: mockNotifications });
        });

        it('should return unauthorized if no session exists', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(null);

            const response = await getInbox();

            expect(response).toEqual({ success: false, error: "Unauthorized" });
            expect(mockInstance.getUserNotifications).not.toHaveBeenCalled();
        });

        it('should handle service failure', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(mockSession);
            mockInstance.getUserNotifications.mockRejectedValue(new Error("DB Error"));

            const response = await getInbox();

            expect(response).toEqual({ success: false, error: "Failed to retrieve notifications" });
        });
    });

    describe('getUnreadCount', () => {
        it('should retrieve unread count successfully', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(mockSession);
            const mockUnread = [{ id: 1 }, { id: 2 }];

            mockInstance.getUnreadNotifications.mockResolvedValue(mockUnread);

            const response = await getUnreadCount();

            expect(mockInstance.getUnreadNotifications).toHaveBeenCalledWith(BigInt(1));
            expect(response).toEqual({ success: true, data: 2 });
        });

        it('should return unauthorized if no session exists', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(null);

            const response = await getUnreadCount();

            expect(response).toEqual({ success: false, error: "Unauthorized" });
        });

        it('should handle service failure', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(mockSession);
            mockInstance.getUnreadNotifications.mockRejectedValue(new Error("DB Error"));

            const response = await getUnreadCount();

            expect(response).toEqual({ success: false, error: "Failed to retrieve unread count" });
        });
    });

    describe('markAsRead', () => {
        it('should mark notification as read successfully', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(mockSession);
            mockInstance.markNotificationAsRead.mockResolvedValue({ id: 10, isRead: true });

            const response = await markAsRead(BigInt(10));

            expect(mockInstance.markNotificationAsRead).toHaveBeenCalledWith(BigInt(10));
            expect(response).toEqual({ success: true, message: "Notification marked as read" });
        });

        it('should return unauthorized if no session exists', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(null);

            const response = await markAsRead(BigInt(10));

            expect(response).toEqual({ success: false, error: "Unauthorized" });
        });

        it('should handle service failure', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(mockSession);
            mockInstance.markNotificationAsRead.mockRejectedValue(new Error("DB Error"));

            const response = await markAsRead(BigInt(10));

            expect(response).toEqual({ success: false, error: "Failed to mark notification as read" });
        });
    });

    describe('markAllAsRead', () => {
        it('should mark all notifications as read successfully', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(mockSession);
            mockInstance.markAllNotificationsAsRead.mockResolvedValue({ count: 5 });

            const response = await markAllAsRead();

            expect(mockInstance.markAllNotificationsAsRead).toHaveBeenCalledWith(BigInt(1));
            expect(response).toEqual({ success: true, message: "All notifications marked as read" });
        });

        it('should return unauthorized if no session exists', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(null);

            const response = await markAllAsRead();

            expect(response).toEqual({ success: false, error: "Unauthorized" });
        });

        it('should handle service failure', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(mockSession);
            mockInstance.markAllNotificationsAsRead.mockRejectedValue(new Error("DB Error"));

            const response = await markAllAsRead();

            expect(response).toEqual({ success: false, error: "Failed to mark all notifications as read" });
        });
    });

    describe('getNotificationsPreferences', () => {
        it('should retrieve preferences successfully for CITIZEN', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(mockSession);
            const mockPrefs = { emailEnabled: true, telegramEnabled: false };
            
            mockInstance.getNotificationsPreferences.mockResolvedValue({ success: true, data: mockPrefs });

            const response = await getNotificationsPreferences();

            expect(mockInstance.getNotificationsPreferences).toHaveBeenCalledWith("testuser");
            expect(response).toEqual({ success: true, data: mockPrefs });
        });

        it('should fail for non-CITIZEN roles', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(mockOfficerSession);

            const response = await getNotificationsPreferences();

            expect(response).toEqual({ success: false, error: "Unauthorized access" });
            expect(mockInstance.getNotificationsPreferences).not.toHaveBeenCalled();
        });

        it('should fail if no session exists', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(null);

            const response = await getNotificationsPreferences();

            expect(response).toEqual({ success: false, error: "Unauthorized access" });
        });
    });

    describe('updateNotificationsPreferences', () => {
        const newPrefs = { emailEnabled: false, telegramEnabled: true };

        it('should update preferences successfully for CITIZEN', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(mockSession);
            mockInstance.updateNotificationsPreferences.mockResolvedValue({ success: true, data: newPrefs });

            const response = await updateNotificationsPreferences(newPrefs);

            expect(mockInstance.updateNotificationsPreferences).toHaveBeenCalledWith("testuser", newPrefs);
            expect(response).toEqual({ success: true, data: newPrefs });
        });

        it('should fail for non-CITIZEN roles', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(mockOfficerSession);

            const response = await updateNotificationsPreferences(newPrefs);

            expect(response).toEqual({ success: false, error: "Unauthorized access" });
            expect(mockInstance.updateNotificationsPreferences).not.toHaveBeenCalled();
        });

        it('should fail if no session exists', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(null);

            const response = await updateNotificationsPreferences(newPrefs);

            expect(response).toEqual({ success: false, error: "Unauthorized access" });
        });
    });
});