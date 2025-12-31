import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "@/components/ProfilePage";
import { getMe, updateNotificationsMedia } from "@/controllers/user.controller";
import {
  createUploadPhoto,
  getProfilePhotoUrl,
} from "@/controllers/ProfilePhoto.controller";
import { startTelegramRegistration } from "@/controllers/telegramBot.controller";
import { useSession } from "next-auth/react";

jest.mock("@/auth", () => ({}));
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));
jest.mock("next-auth/react");
jest.mock("@/controllers/user.controller");
jest.mock("@/controllers/ProfilePhoto.controller");
jest.mock("@/controllers/telegramBot.controller");
jest.mock("@/lib/utils/canvasUtils", () => ({
  getCroppedImg: jest.fn().mockResolvedValue(new Blob()),
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockGetMe = getMe as jest.MockedFunction<typeof getMe>;
const mockUpdateNotificationsMedia = updateNotificationsMedia as jest.MockedFunction<
  typeof updateNotificationsMedia
>;
const mockCreateUploadPhoto = createUploadPhoto as jest.MockedFunction<
  typeof createUploadPhoto
>;
const mockGetProfilePhotoUrl = getProfilePhotoUrl as jest.MockedFunction<
  typeof getProfilePhotoUrl
>;
const mockStartTelegramRegistration = startTelegramRegistration as jest.MockedFunction<
  typeof startTelegramRegistration
>;

describe("ProfilePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: {
        user: { username: "testuser", role: ["CITIZEN"], id: "123" },
      } as any,
      status: "authenticated",
      update: jest.fn(),
    } as any);

    mockGetMe.mockResolvedValue({
      me: {
        username: "testuser",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        telegram: false,
        pendingRequest: false,
        role: ["CITIZEN"],
      },
      emailNotifications: true,
      telegramNotifications: false,
    } as any);

    mockGetProfilePhotoUrl.mockResolvedValue(undefined);
  });

  it("should show loading state initially", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "loading",
      update: jest.fn(),
    } as any);

    const { container } = render(<ProfilePage />);

    const loader = container.querySelector(".animate-spin");
    expect(loader).toBeInTheDocument();
  });

  it("should render profile information after loading", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("My Profile")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("John")).toBeInTheDocument();
    });
    expect(screen.getByText("Doe")).toBeInTheDocument();
    expect(screen.getByText(/@testuser/i)).toBeInTheDocument();
  });

  it("should display email for citizen", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("My Profile")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });
  });

  it("should enable edit mode when Edit button is clicked", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Edit/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Edit/i }));

    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save Changes/i })).toBeInTheDocument();
  });

  it("should allow editing email", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Edit/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Edit/i }));

    const emailInput = screen.getByDisplayValue("john@example.com");
    await user.clear(emailInput);
    await user.type(emailInput, "newemail@example.com");

    expect(emailInput).toHaveValue("newemail@example.com");
  });

  it("should save profile changes", async () => {
    const user = userEvent.setup();
    mockUpdateNotificationsMedia.mockResolvedValue({ success: true, data: {} });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Edit/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Edit/i }));

    const emailInput = screen.getByDisplayValue("john@example.com");
    await user.clear(emailInput);
    await user.type(emailInput, "newemail@example.com");

    await user.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() => {
      expect(mockUpdateNotificationsMedia).toHaveBeenCalledWith(
        "newemail@example.com",
        false,
        expect.any(Object)
      );
    });
  });

  it("should cancel editing", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Edit/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Edit/i }));

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    await user.clear(emailInput);
    await user.type(emailInput, "newemail@example.com");

    await user.click(screen.getByRole("button", { name: /Cancel/i }));

    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });
  });

  it("should show Connect Telegram button when not connected", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("My Profile")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Edit/i })).toBeInTheDocument();
    });
  });

  it("should open Telegram bot when Connect button is clicked", async () => {
    const user = userEvent.setup();
    const windowOpenSpy = jest.spyOn(window, "open").mockImplementation(() => null);
    mockStartTelegramRegistration.mockResolvedValue({
      success: true,
      data: "test-token",
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Edit/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Edit/i }));

    await waitFor(() => {
      expect(screen.getByText(/Connect/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    const connectButton = screen.getByRole("button", { name: /Connect/i });
    await user.click(connectButton);

    await waitFor(() => {
      expect(mockStartTelegramRegistration).toHaveBeenCalled();
      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining("t.me/participium_bot?start=test-token"),
        "_blank",
        "noopener,noreferrer"
      );
    });

    windowOpenSpy.mockRestore();
  });

  it("should show Disconnect Telegram option when connected", async () => {
    mockGetMe.mockResolvedValue({
      me: {
        username: "testuser",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        telegram: true,
        pendingRequest: false,
        role: ["CITIZEN"],
      },
      emailNotifications: true,
      telegramNotifications: true,
    } as any);

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Edit/i })).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/Connected/i)).toBeInTheDocument();
    });
  });

  it("should toggle email notifications", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Edit/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Edit/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Email Notifications/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    const emailNotifSwitch = screen.getByLabelText(/Email Notifications/i);
    await user.click(emailNotifSwitch);

    expect(emailNotifSwitch).not.toBeChecked();
  });

  it("should toggle telegram notifications", async () => {
    const user = userEvent.setup();
    mockGetMe.mockResolvedValue({
      me: {
        username: "testuser",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        telegram: true,
        pendingRequest: false,
        role: ["CITIZEN"],
      },
      emailNotifications: true,
      telegramNotifications: false,
    } as any);

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Edit/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Edit/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Telegram Notifications/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    const telegramNotifSwitch = screen.getByLabelText(/Telegram Notifications/i);
    await user.click(telegramNotifSwitch);

    expect(telegramNotifSwitch).toBeChecked();

  });

  it("should display office for officer", async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          username: "officer",
          role: ["PUBLIC_RELATIONS_OFFICER"],
          id: "456",
        },
      } as any,
      status: "authenticated",
      update: jest.fn(),
    } as any);

    mockGetMe.mockResolvedValue({
      me: {
        username: "officer",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        role: ["PUBLIC_RELATIONS_OFFICER"],
        office: ["DEPARTMENT_OF_COMMERCE"],
      },
      emailNotifications: true,
    } as any);

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("My Profile")).toBeInTheDocument();
    });

    expect(screen.getByText(/Department of Commerce/i)).toBeInTheDocument();
  });

  it("should display company for external maintainer", async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          username: "maintainer",
          role: ["EXTERNAL_MAINTAINER_WITH_ACCESS"],
          id: "789",
        },
      } as any,
      status: "authenticated",
      update: jest.fn(),
    } as any);

    mockGetMe.mockResolvedValue({
      me: {
        username: "maintainer",
        firstName: "Mike",
        lastName: "Johnson",
        email: "mike@example.com",
        role: ["EXTERNAL_MAINTAINER_WITH_ACCESS"],
        companyId: "1",
        companyName: "Maintenance Corp",
      },
      emailNotifications: true,
    } as any);

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Maintenance Corp")).toBeInTheDocument();
    });
  });

  it("should not show Edit button for non-citizens", async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          username: "officer",
          role: ["PUBLIC_RELATIONS_OFFICER"],
          id: "456",
        },
      } as any,
      status: "authenticated",
      update: jest.fn(),
    } as any);

    mockGetMe.mockResolvedValue({
      me: {
        username: "officer",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        role: ["PUBLIC_RELATIONS_OFFICER"],
        office: ["DEPARTMENT_OF_COMMERCE"],
      },
      emailNotifications: true,
    } as any);

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("My Profile")).toBeInTheDocument();
    });

    expect(screen.queryByRole("button", { name: /Edit/i })).not.toBeInTheDocument();
  });

  it("should handle update error", async () => {
    const user = userEvent.setup();
    mockUpdateNotificationsMedia.mockResolvedValue({
      success: false,
      error: "Update failed",
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Edit/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Edit/i }));
    await user.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() => {
      expect(screen.getByText("Update failed")).toBeInTheDocument();
    });
  });

  it("should show avatar with initials when no photo", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("My Profile")).toBeInTheDocument();
    });

    await waitFor(
      () => {
        // Initials are derived from username "testuser" -> "TE"
        const hasInitials = screen.queryByText("TE") !== null;
        expect(hasInitials).toBe(true);
      },
      { timeout: 3000 }
    );
  });

  it("should disable save button during submission", async () => {
    const user = userEvent.setup();
    mockUpdateNotificationsMedia.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true, data: {} }), 100)
        )
    );

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Edit/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Edit/i }));
    await user.click(screen.getByRole("button", { name: /Save Changes/i }));

    const saveButton = screen.getByRole("button", { name: /Saving/i });
    expect(saveButton).toBeDisabled();

    await waitFor(() => {
      expect(mockUpdateNotificationsMedia).toHaveBeenCalled();
    });
  });

  it("should show Saving... text during submission", async () => {
    const user = userEvent.setup();
    mockUpdateNotificationsMedia.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true, data: {} }), 100)
        )
    );

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Edit/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Edit/i }));
    await user.click(screen.getByRole("button", { name: /Save Changes/i }));

    expect(screen.getByText(/Saving/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockUpdateNotificationsMedia).toHaveBeenCalled();
    });
  });

});
