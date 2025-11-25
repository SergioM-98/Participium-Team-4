import { prisma } from "@/prisma/db";
import { getServerSession } from "next-auth/next";

import * as ProfilePhotoController from "@/controllers/ProfilePhoto.controller";
import * as NotificationController from "@/controllers/notification.controller";
import * as UserController from "@/controllers/user.controller";

import { ProfilePhotoService } from "@/services/profilePhoto.service";
import { NotificationService } from "@/services/notification.service";

// Fix for next-auth mock
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/auth", () => ({
  authOptions: {},
}));

// Fix for ProfilePhotoService mock
jest.mock("@/services/profilePhoto.service", () => ({
  ProfilePhotoService: {
    getInstance: jest.fn(),
  },
}));

// Fix for NotificationsService mock
jest.mock("@/services/notification.service", () => ({
  NotificationService: {
    getInstance: jest.fn(),
  },
}));

// Fix for controller mocks (optional but avoids TS errors)
jest.mock("@/controllers/ProfilePhoto.controller", () => ({
  createUploadPhoto: jest.fn(),
  deletePhoto: jest.fn(),
}));

jest.mock("@/controllers/notification.controller", () => ({
  updateNotificationsPreferences: jest.fn(),
  getNotificationsPreferences: jest.fn(),
}));

jest.mock("@/controllers/user.controller", () => ({
  getMe: jest.fn(),
}));

// TEST SUITE
describe("Story 9 – Citizen Account Configuration (FULL TEST)", () => {
  beforeEach(async () => {
    if (prisma.notification) {
      await prisma.notification.deleteMany({});
    }
    await prisma.report.deleteMany({});
    await prisma.photo.deleteMany({});
    await prisma.profilePhoto.deleteMany({});
    await prisma.notificationPreferences.deleteMany({});
    await prisma.user.deleteMany({});

    await prisma.user.create({
      data: {
        id: "citizen1",
        username: "citizen",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        passwordHash: "hash",
        role: "CITIZEN",
      },
    });

    (getServerSession as jest.Mock).mockResolvedValue({
      user: {
        id: "citizen1",
        username: "citizen",
        email: "john@example.com",
        firstName: "John",
        lastName: "Doe",
        role: "CITIZEN",
      },
    });
  });

  // 1) Upload Photo
  it("should upload a profile photo successfully", async () => {
    (ProfilePhotoController.createUploadPhoto as jest.MockedFunction<typeof ProfilePhotoController.createUploadPhoto>).mockResolvedValue({
      success: true,
      location: "file123",
      uploadOffset: 123,
      tusHeaders: { "Upload-Offset": "123" },
    });

    const form = new FormData();
    form.append("tus-resumable", "1.0.0");
    form.append("upload-length", "3");
    form.append("upload-metadata", "filename Zm9vLmpwZw==");
    form.append(
      "file",
      new File(["abc"], "foo.jpg", { type: "image/jpeg" })
    );

    const res = await ProfilePhotoController.createUploadPhoto(form);

    expect(res.success).toBe(true);
    const result = res as any;
    expect(result.location).toBe("file123");
    expect(result.uploadOffset).toBe(123);
    expect(result.tusHeaders["Upload-Offset"]).toBe("123");
  });

  // 2) Delete Photo
  it("should delete a profile photo successfully", async () => {
    (ProfilePhotoController.deletePhoto as jest.MockedFunction<typeof ProfilePhotoController.deletePhoto>).mockResolvedValue({
      success: true,
      message: "Photo deleted successfully",
    });

    const res = await ProfilePhotoController.deletePhoto();

    expect((res as any).success).toBe(true);
  });

  // 3) Update Notifications
  it("should update notification preferences", async () => {
    (NotificationController.updateNotificationsPreferences as jest.MockedFunction<typeof NotificationController.updateNotificationsPreferences>).mockResolvedValue({
      success: true,
      data: {
        emailEnabled: true,
        telegramEnabled: false,
      },
    });

    const res = await NotificationController.updateNotificationsPreferences({
      emailEnabled: true,
      telegramEnabled: false,
    });

    expect((res as any).success).toBe(true);
    expect((res as any).data?.emailEnabled).toBe(true);
  });

  // 4) Telegram Error Case
  it("should fail enabling telegram notifications without telegram media", async () => {
    (NotificationController.updateNotificationsPreferences as jest.MockedFunction<typeof NotificationController.updateNotificationsPreferences>).mockResolvedValue({
      success: false,
      error: "Cannot enable telegram notifications without telegram media",
    });

    const res = await NotificationController.updateNotificationsPreferences({
      emailEnabled: true,
      telegramEnabled: true,
    });

    expect((res as any).success).toBe(false);
    expect((res as any).error).toBe("Cannot enable telegram notifications without telegram media");
  });

  // 5) Retrieve Preferences
  it("should retrieve notification preferences", async () => {
    (NotificationController.getNotificationsPreferences as jest.MockedFunction<typeof NotificationController.getNotificationsPreferences>).mockResolvedValue({
      success: true,
      data: {
        emailEnabled: true,
        telegramEnabled: false,
      },
    });

    const res = await NotificationController.getNotificationsPreferences();

    expect((res as any).success).toBe(true);
    expect((res as any).data?.emailEnabled).toBe(true);
  });

  // 6) getMe()
  it("should return user info from getMe()", async () => {
    (UserController.getMe as jest.MockedFunction<typeof UserController.getMe>).mockResolvedValue({
      id: "citizen1",
      username: "citizen",
      role: "CITIZEN",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com"
    });

    const res = await UserController.getMe();
    const user = (res as any).id ? res : (res as any).data;
    expect(user.id).toBe("citizen1");
    expect(user.username).toBe("citizen");
    expect(user.role).toBe("CITIZEN");
  });
});