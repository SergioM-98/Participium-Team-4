import { prisma } from "../../setup";
import bcrypt from "bcrypt";
import path from "path";
import fs from "fs/promises";
import { Message } from "@prisma/client";
import {
  getReportMessages,
  sendMessage,
} from "../../../src/app/lib/controllers/message.controller";
import {
  getInbox,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "../../../src/app/lib/controllers/notification.controller";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    handlers: { GET: jest.fn(), POST: jest.fn() },
    auth: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  })),
}));

jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

import { getServerSession } from "next-auth/next";
import { bigint } from "zod";

describe("Story 11 - officer updates", () => {
  const userSession = {
    user: {
      id: "1",
      name: "Logged User",
      role: "CITIZEN",
    },
    expires: "2024-12-31T23:59:59.999Z",
  };
  let testMessage: Message;
  let testCitizenId: string;
  let testOfficerId: string;

  beforeEach(async () => {
    // Clean database before each test - IMPORTANT: delete notifications first due to foreign key constraints
    await prisma.notification.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.report.deleteMany({});
    await prisma.photo.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test citizen
    const hashedPassword = await bcrypt.hash("testpassword", 12);
    const citizen = await prisma.user.create({
      data: {
        username: "testcitizen_story11",
        firstName: "Test",
        lastName: "Citizen",
        passwordHash: hashedPassword,
        role: "CITIZEN",
      },
    });
    testCitizenId = citizen.id;

    // Create test officer
    const officer = await prisma.user.create({
      data: {
        username: "testofficer_story11",
        firstName: "Test",
        lastName: "Officer",
        passwordHash: hashedPassword,
        role: "TECHNICAL_OFFICER",
        office: "DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES",
      },
    });
    testOfficerId = officer.id;

    testMessage = {
      id: BigInt(1),
      content: "This is a test message",
      authorId: testOfficerId,
      reportId: BigInt(1),
      createdAt: new Date(),
    };
  });

  afterAll(async () => {
    await prisma.notification.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.report.deleteMany({});
    await prisma.photo.deleteMany({});
    await prisma.user.deleteMany({});
  });

  it("should allow an officer to send a message and notify the citizen", async () => {
    // First create a report so the message has a valid reportId
    const report = await prisma.report.create({
      data: {
        title: "Test Report",
        description: "This is a test report",
        status: "IN_PROGRESS",
        category: "OTHER",
        longitude: 7,
        latitude: 40,
        citizenId: testCitizenId,
        officerId: testOfficerId,
      },
    });

    // Simulate officer sending a message
    const createdMessage = await sendMessage(
      testMessage.content,
      testMessage.authorId,
      report.id
    );
    expect(createdMessage).toBeDefined();
    const messageResult = await prisma.message.findFirst({
      where: {
        content: testMessage.content,
        authorId: testMessage.authorId,
        reportId: report.id,
      },
    });
    expect(messageResult).not.toBeNull();
    expect(messageResult?.content).toBe(testMessage.content);
  });

  it("should retrieve messages for a report", async () => {
    const report = await prisma.report.create({
      data: {
        title: "Test Report",
        description: "This is a test report",
        status: "IN_PROGRESS",
        category: "OTHER",
        createdAt: new Date(),
        longitude: 7,
        latitude: 40,
        citizenId: testCitizenId,
        officerId: testOfficerId,
      },
    });

    const message1 = await prisma.message.create({
      data: {
        content: "First message",
        authorId: testOfficerId,
        reportId: report.id,
      },
    });

    const message2 = await prisma.message.create({
      data: {
        content: "Second message",
        authorId: testCitizenId,
        reportId: report.id,
      },
    });

    const messages = await getReportMessages(report.id);
    expect(messages.length).toBe(2);
    expect(messages[0].content).toBe("First message");
    expect(messages[1].content).toBe("Second message");
  });

  it("should handle no messages for a report", async () => {
    const report = await prisma.report.create({
      data: {
        title: "Empty Report",
        description: "This report has no messages",
        status: "IN_PROGRESS",
        category: "OTHER",
        createdAt: new Date(),
        longitude: 7,
        latitude: 40,
        citizenId: testCitizenId,
        officerId: testOfficerId,
      },
    });

    const messages = await getReportMessages(report.id);
    expect(messages.length).toBe(0);
  });

  it("should retrieve the user notifications", async () => {
    // Create a report first
    const report = await prisma.report.create({
      data: {
        title: "Test Report",
        description: "This is a test report",
        status: "IN_PROGRESS",
        category: "OTHER",
        longitude: 7,
        latitude: 40,
        citizenId: testCitizenId,
        officerId: testOfficerId,
      },
    });

    const notificationOne = await prisma.notification.create({
      data: {
        type: "STATUS_CHANGE",
        message: "Your report status has been updated to: APPROVED",
        recipientId: testCitizenId,
        reportId: report.id,
      },
    });

    // Set the session BEFORE calling getInbox
    const citizenSession = {
      user: {
        id: testCitizenId,
        name: "Test Citizen",
        role: "CITIZEN",
      },
      expires: "2024-12-31T23:59:59.999Z",
    };
    (getServerSession as jest.Mock).mockResolvedValue(citizenSession);

    const notificationTwo = await prisma.notification.create({
      data: {
        type: "NEW_MESSAGE",
        message: "officer-123 sent you a new message on your report",
        recipientId: testCitizenId,
        reportId: report.id,
      },
    });

    const notificationThree = await prisma.notification.create({
      data: {
        type: "NEW_MESSAGE",
        message: "officer-123 sent you a new message on your report",
        recipientId: testOfficerId,
        reportId: report.id,
      },
    });

    const notifications = await getInbox();
    expect(notifications.success).toBe(true);
    if (notifications.success && notifications.data) {
      expect(notifications.data.length).toBe(2);
      const messages = notifications.data.map((n) => n.message);
      expect(messages).toContain(
        "Your report status has been updated to: APPROVED"
      );
      expect(messages).toContain(
        "officer-123 sent you a new message on your report"
      );
    }
  });

  it("should return the number of unread messages", async () => {
    // Create a report first
    const report = await prisma.report.create({
      data: {
        title: "Test Report",
        description: "This is a test report",
        status: "IN_PROGRESS",
        category: "OTHER",
        longitude: 7,
        latitude: 40,
        citizenId: testCitizenId,
        officerId: testOfficerId,
      },
    });

    (getServerSession as jest.Mock).mockResolvedValue(userSession);

    await prisma.notification.createMany({
      data: [
        {
          type: "STATUS_CHANGE",
          message: "Your report status has been updated to: APPROVED",
          recipientId: testCitizenId,
          reportId: report.id,
          isRead: false,
        },
        {
          type: "NEW_MESSAGE",
          message: "officer-123 sent you a new message on your report",
          recipientId: testCitizenId,
          reportId: report.id,
          isRead: false,
        },
        {
          type: "NEW_MESSAGE",
          message: "officer-123 sent you a new message on your report",
          recipientId: testCitizenId,
          reportId: report.id,
          isRead: true,
        },
      ],
    });

    const unreadCountResult = await getUnreadCount();
    expect(unreadCountResult.success).toBe(true);
    if (unreadCountResult.success && unreadCountResult.data) {
      expect(unreadCountResult.data).toBe(2);
    }
  });

  it("should mark notifications as read", async () => {
    // Create a report first
    const report = await prisma.report.create({
      data: {
        title: "Test Report",
        description: "This is a test report",
        status: "IN_PROGRESS",
        category: "OTHER",
        longitude: 7,
        latitude: 40,
        citizenId: testCitizenId,
        officerId: testOfficerId,
      },
    });

    const notification = await prisma.notification.create({
      data: {
        type: "STATUS_CHANGE",
        message: "Your report status has been updated to: APPROVED",
        recipientId: testCitizenId,
        reportId: report.id,
        isRead: false,
      },
    });

    await markAsRead(notification.id);

    const updatedNotification = await prisma.notification.findUnique({
      where: { id: notification.id },
    });

    expect(updatedNotification).not.toBeNull();
    expect(updatedNotification?.isRead).toBe(true);
  });

  it("should mark all notifications of a user as read", async () => {
    // Create a report first
    const report = await prisma.report.create({
      data: {
        title: "Test Report",
        description: "This is a test report",
        status: "IN_PROGRESS",
        category: "OTHER",
        longitude: 7,
        latitude: 40,
        citizenId: testCitizenId,
        officerId: testOfficerId,
      },
    });

    const citizenSession = {
      user: {
        id: testCitizenId,
        name: "Test Citizen",
        role: "CITIZEN",
      },
      expires: "2024-12-31T23:59:59.999Z",
    };
    (getServerSession as jest.Mock).mockResolvedValue(citizenSession);

    await prisma.notification.createMany({
      data: [
        {
          type: "STATUS_CHANGE",
          message: "Your report status has been updated to: APPROVED",
          recipientId: testCitizenId,
          reportId: report.id,
          isRead: false,
        },
        {
          type: "NEW_MESSAGE",
          message: "officer-123 sent you a new message on your report",
          recipientId: testCitizenId,
          reportId: report.id,
          isRead: false,
        },
      ],
    });
    const result = await markAllAsRead();

    expect(result.success).toBe(true);

    const notifications = await prisma.notification.findMany({
      where: { recipientId: testCitizenId },
    });

    notifications.forEach((notification) => {
      expect(notification.isRead).toBe(true);
    });
  });

  it("should handle unauthorized access to notifications", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const inboxResult = await getInbox();
    expect(inboxResult.success).toBe(false);
    expect(inboxResult.error).toBe("Unauthorized");

    const unreadCountResult = await getUnreadCount();
    expect(unreadCountResult.success).toBe(false);
    expect(unreadCountResult.error).toBe("Unauthorized");

    const markAsReadResult = await markAsRead(BigInt(1));
    expect(markAsReadResult.success).toBe(false);
    expect(markAsReadResult.error).toBe("Unauthorized");

    const markAllAsReadResult = await markAllAsRead();
    expect(markAllAsReadResult.success).toBe(false);
    expect(markAllAsReadResult.error).toBe("Unauthorized");
  });
});
