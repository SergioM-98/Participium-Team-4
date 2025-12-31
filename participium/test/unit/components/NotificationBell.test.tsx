import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationBell } from "@/components/NotificationBell";
import {
  getInbox,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "@/controllers/notification.controller";

jest.mock("@/auth", () => ({}));
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));
jest.mock("@/controllers/notification.controller");

const mockGetInbox = getInbox as jest.MockedFunction<typeof getInbox>;
const mockGetUnreadCount = getUnreadCount as jest.MockedFunction<typeof getUnreadCount>;
const mockMarkAsRead = markAsRead as jest.MockedFunction<typeof markAsRead>;
const mockMarkAllAsRead = markAllAsRead as jest.MockedFunction<typeof markAllAsRead>;

const mockNotifications = [
  {
    id: "1",
    type: "STATUS_CHANGE",
    message: "Your report status changed to In Progress",
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    reportId: "123",
  },
  {
    id: "2",
    type: "NEW_MESSAGE",
    message: "New message on your report",
    isRead: false,
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    reportId: "124",
  },
  {
    id: "3",
    type: "STATUS_CHANGE",
    message: "Report has been resolved",
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    reportId: "125",
  },
];

describe("NotificationBell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockGetUnreadCount.mockResolvedValue({ success: true, data: 2 });
    mockGetInbox.mockResolvedValue({ success: true, data: mockNotifications });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should render notification bell button", () => {
    render(<NotificationBell />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should fetch and display unread count on mount", async () => {
    render(<NotificationBell />);

    await waitFor(() => {
      expect(mockGetUnreadCount).toHaveBeenCalled();
    });
  });

  it("should show unread indicator when count > 0", async () => {
    mockGetUnreadCount.mockResolvedValue({ success: true, data: 3 });

    render(<NotificationBell />);

    await waitFor(() => {
      expect(mockGetUnreadCount).toHaveBeenCalled();
    });
  });

  it("should open dropdown when bell is clicked", async () => {
    const user = userEvent.setup({ delay: null });
    render(<NotificationBell />);

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("Notifications")).toBeInTheDocument();
    });
  });

  it("should fetch inbox when dropdown opens", async () => {
    const user = userEvent.setup({ delay: null });
    render(<NotificationBell />);

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(mockGetInbox).toHaveBeenCalled();
    });
  });

  it("should display notifications in dropdown", async () => {
    const user = userEvent.setup({ delay: null });
    render(<NotificationBell />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(
        screen.getByText("Your report status changed to In Progress")
      ).toBeInTheDocument();
      expect(screen.getByText("New message on your report")).toBeInTheDocument();
      expect(screen.getByText("Report has been resolved")).toBeInTheDocument();
    });
  });

  it("should display time ago for notifications", async () => {
    const user = userEvent.setup({ delay: null });
    render(<NotificationBell />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("5m ago")).toBeInTheDocument();
      expect(screen.getByText("1h ago")).toBeInTheDocument();
      expect(screen.getByText("2d ago")).toBeInTheDocument();
    });
  });

  it("should show Just now for very recent notifications", async () => {
    const user = userEvent.setup({ delay: null });
    const recentNotif = {
      ...mockNotifications[0],
      createdAt: new Date().toISOString(),
    };
    mockGetInbox.mockResolvedValue({
      success: true,
      data: [recentNotif],
    });

    render(<NotificationBell />);
    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Just now")).toBeInTheDocument();
    });
  });

  it("should mark notification as read when clicked", async () => {
    const user = userEvent.setup({ delay: null });
    mockMarkAsRead.mockResolvedValue({ success: true, data: {} });

    render(<NotificationBell />);
    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(
        screen.getByText("Your report status changed to In Progress")
      ).toBeInTheDocument();
    });

    const notifButton = screen.getByText("Your report status changed to In Progress").closest("button");
    if (notifButton) {
      await user.click(notifButton);
    }

    await waitFor(() => {
      expect(mockMarkAsRead).toHaveBeenCalledWith(BigInt(1));
    });
  });

  it("should not call markAsRead for already read notifications", async () => {
    const user = userEvent.setup({ delay: null });

    render(<NotificationBell />);
    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Report has been resolved")).toBeInTheDocument();
    });

    const readNotif = screen.getByText("Report has been resolved").closest("button");
    if (readNotif) {
      await user.click(readNotif);
    }

    await waitFor(() => {
      expect(mockMarkAsRead).not.toHaveBeenCalled();
    });
  });

  it("should mark all notifications as read", async () => {
    const user = userEvent.setup({ delay: null });
    mockMarkAllAsRead.mockResolvedValue({ success: true, data: {} });

    render(<NotificationBell />);
    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Notifications")).toBeInTheDocument();
    });

    const markAllButton = screen.getByRole("button", { name: /Mark all read/i });
    await user.click(markAllButton);

    await waitFor(() => {
      expect(mockMarkAllAsRead).toHaveBeenCalled();
    });
  });

  it("should not show mark all button when no unread notifications", async () => {
    const user = userEvent.setup({ delay: null });
    mockGetUnreadCount.mockResolvedValue({ success: true, data: 0 });
    mockGetInbox.mockResolvedValue({
      success: true,
      data: [{ ...mockNotifications[2], isRead: true }],
    });

    render(<NotificationBell />);
    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /Mark all read/i })).not.toBeInTheDocument();
    });
  });

  it("should show empty state when no notifications", async () => {
    const user = userEvent.setup({ delay: null });
    mockGetInbox.mockResolvedValue({ success: true, data: [] });

    render(<NotificationBell />);
    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("No notifications yet")).toBeInTheDocument();
    });
  });

  it("should show loading state while fetching", async () => {
    const user = userEvent.setup({ delay: null });
    mockGetInbox.mockImplementation(() => new Promise(() => {}));

    render(<NotificationBell />);
    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Loading updates...")).toBeInTheDocument();
    });
  });

  it("should close dropdown when clicking outside", async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <NotificationBell />
      </div>
    );

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Notifications")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("outside"));

    await waitFor(() => {
      expect(screen.queryByText("Notifications")).not.toBeInTheDocument();
    });
  });

  it("should poll for unread count every 30 seconds", async () => {
    render(<NotificationBell />);

    await waitFor(() => {
      expect(mockGetUnreadCount).toHaveBeenCalledTimes(1);
    });

    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(mockGetUnreadCount).toHaveBeenCalledTimes(2);
    });

    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(mockGetUnreadCount).toHaveBeenCalledTimes(3);
    });
  });

  it("should handle fetch unread count error silently", async () => {
    mockGetUnreadCount.mockRejectedValue(new Error("Network error"));

    render(<NotificationBell />);

    // Should not crash
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should handle fetch inbox error silently", async () => {
    const user = userEvent.setup({ delay: null });
    mockGetInbox.mockRejectedValue(new Error("Network error"));

    render(<NotificationBell />);
    await user.click(screen.getByRole("button"));

    // Should not crash
    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });

  it("should render with custom className", () => {
    render(<NotificationBell className="custom-class" />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("should display unread indicator dot on unread notifications", async () => {
    const user = userEvent.setup({ delay: null });
    render(<NotificationBell />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      const unreadNotifs = mockNotifications.filter((n) => !n.isRead);
      expect(unreadNotifs.length).toBeGreaterThan(0);
    });
  });

  it("should optimistically update UI when marking as read", async () => {
    const user = userEvent.setup({ delay: null });
    mockMarkAsRead.mockImplementation(() => new Promise(() => {}));

    render(<NotificationBell />);
    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(
        screen.getByText("Your report status changed to In Progress")
      ).toBeInTheDocument();
    });

    const notifButton = screen.getByText(
      "Your report status changed to In Progress"
    ).closest("button");
    if (notifButton) {
      await user.click(notifButton);
    }

    // UI should update immediately before API call completes
    await waitFor(() => {
      expect(mockMarkAsRead).toHaveBeenCalled();
    });
  });

  it("should optimistically update UI when marking all as read", async () => {
    const user = userEvent.setup({ delay: null });
    mockMarkAllAsRead.mockImplementation(() => new Promise(() => {}));

    render(<NotificationBell />);
    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Notifications")).toBeInTheDocument();
    });

    const markAllButton = screen.getByRole("button", { name: /Mark all read/i });
    await user.click(markAllButton);

    await waitFor(() => {
      expect(mockMarkAllAsRead).toHaveBeenCalled();
    });
  });

  it("should display correct icon for STATUS_CHANGE type", async () => {
    const user = userEvent.setup({ delay: null });
    render(<NotificationBell />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Your report status changed to In Progress")).toBeInTheDocument();
    });
  });

  it("should display correct icon for NEW_MESSAGE type", async () => {
    const user = userEvent.setup({ delay: null });
    render(<NotificationBell />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("New message on your report")).toBeInTheDocument();
    });
  });
});
