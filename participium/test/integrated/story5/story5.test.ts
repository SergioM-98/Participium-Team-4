import { prisma } from "../../setup";
import { getServerSession } from "next-auth/next";
import { ReportRegistrationResponse } from "../../../src/app/lib/dtos/report.dto";
import {  } from "../../../src/app/lib/controllers/report.controller";
import { createUploadPhoto } from "../../../src/app/lib/controllers/uploader.controller";
import { ControllerSuccessResponse } from "../../../src/app/lib/dtos/tus.dto";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

describe("Story 5 - Integration Test: uploader", () => {
  beforeEach(async () => {
    if (prisma.notification) await prisma.notification.deleteMany({});
    await prisma.photo.deleteMany({});
    await prisma.report.deleteMany({});
    if (prisma.profilePhoto) await prisma.profilePhoto.deleteMany({});
    if (prisma.notificationPreferences) await prisma.notificationPreferences.deleteMany({});
    await prisma.user.deleteMany({});

    await prisma.photo.create({
      data: {
        id: "photo1",
        url: "photo1",
        size: 100,
        offset: 0,
        filename: "photo1",
      },
    });
    await prisma.user.create({
      data: {
        id: "1",
        username: "user1",
        passwordHash: "password",
        firstName: "user",
        lastName: "user",
        role: "CITIZEN",
      },
    });

    await prisma.user.create({
      data: {
        id: "2",
        username: "user2",
        passwordHash: "password",
        firstName: "user",
        lastName: "user",
        role: "CITIZEN",
      },
    });
  });

  describe("uploader Flow", () => {
    it("should upload a new photo through the complete flow", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          firstName: "mock",
          lastName: "mock",
          email: "mock@mock.it",
          username: "mock",
          role: "CITIZEN",
        },
        expires: "2099-01-01T00:00:00.000Z",
      });

      const data = new FormData();
      data.append("tus-resumable", "1.0.0");
      data.append("upload-length", "100");
      data.append(
        "file",
        new File(["a".repeat(100)], "photo.jpg", { type: "image/jpeg" })
      );

      const response: ControllerSuccessResponse = await createUploadPhoto(data);

      expect(response.success).toBe(true);
      if(response.success) {
        expect(response.location).toBeDefined();
        expect(response.uploadOffset).toBe(100);
      }
    });
  });

  it("should not upload a new photo through the complete flow with a missing field", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: {
        firstName: "mock",
        lastName: "mock",
        email: "mock@mock.it",
        username: "mock",
        role: "CITIZEN",
      },
      expires: "2099-01-01T00:00:00.000Z",
    });

    const data = new FormData();
    data.append("upload-length", "100");
    data.append(
      "file",
      new File(["a".repeat(100)], "photo.jpg", { type: "image/jpeg" })
    );

    const result = await createUploadPhoto(data);
    expect(result.success).toBe(false);
  });
});