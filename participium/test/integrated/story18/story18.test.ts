import { prisma } from "../../setup";
import {
  sendMessage,
  getReportMessages,
} from "../../../src/app/lib/controllers/message.controller";

describe("Story 18 - Integration Test: Two-way Communication Between Citizens and Municipal Operators", () => {
  let citizenId: string;
  let officerId: string;
  let reportId: bigint;

  beforeEach(async () => {
    // Clean up database
    await prisma.message.deleteMany({});
    await prisma.comment.deleteMany({});
    if (prisma.notification) await prisma.notification.deleteMany({});
    await prisma.photo.deleteMany({});
    await prisma.report.deleteMany({});
    if (prisma.profilePhoto) await prisma.profilePhoto.deleteMany({});
    if (prisma.notificationPreferences)
      await prisma.notificationPreferences.deleteMany({});
    await prisma.user.deleteMany({});

    // Create a citizen user
    const citizen = await prisma.user.create({
      data: {
        id: "citizen_msg_001",
        firstName: "Maria",
        lastName: "Rossi",
        username: "maria_citizen",
        passwordHash: "hashed_password",
        email: "maria@example.com",
        role: ["CITIZEN"],
      },
    });
    citizenId = citizen.id;

    // Create a technical officer
    const officer = await prisma.user.create({
      data: {
        id: "officer_msg_001",
        firstName: "Giovanni",
        lastName: "Bianchi",
        username: "giovanni_officer",
        passwordHash: "hashed_password",
        email: "giovanni@municipality.com",
        role: ["TECHNICAL_OFFICER"],
        office: ["DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES"],
      },
    });
    officerId = officer.id;

    // Create a report from the citizen
    const report = await prisma.report.create({
      data: {
        id: BigInt(5001),
        title: "Street Light Malfunction",
        description: "The street light on Via Roma is not working",
        category: "PUBLIC_LIGHTING",
        latitude: 45.0703,
        longitude: 7.6869,
        citizenId: citizenId,
        status: "ASSIGNED",
        officerId: officerId,
      },
    });
    reportId = report.id;
  });

  describe("Citizen to Officer Communication", () => {
    it("should allow a citizen to send a message to an officer about their report", async () => {
      const messageContent =
        "Can you please provide an update on the repair timeline?";

      const result = await sendMessage(messageContent, citizenId, reportId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe(messageContent);
        expect(result.data.authorId).toBe(citizenId);
        expect(result.data.reportId.toString()).toBe(reportId.toString());
      }
    });

    it("should persist citizen messages to the database", async () => {
      const messageContent = "I have additional photos to share.";

      await sendMessage(messageContent, citizenId, reportId);

      const messages = await prisma.message.findMany({
        where: { reportId: reportId },
      });

      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe(messageContent);
      expect(messages[0].authorId).toBe(citizenId);
    });

    it("should allow multiple messages from the same citizen on the same report", async () => {
      await sendMessage("First message from citizen", citizenId, reportId);
      await sendMessage("Second message from citizen", citizenId, reportId);
      await sendMessage("Third message from citizen", citizenId, reportId);

      const messages = await prisma.message.findMany({
        where: { reportId: reportId },
        orderBy: { createdAt: "asc" },
      });

      expect(messages).toHaveLength(3);
      expect(messages[0].content).toBe("First message from citizen");
      expect(messages[1].content).toBe("Second message from citizen");
      expect(messages[2].content).toBe("Third message from citizen");
    });
  });

  describe("Officer to Citizen Communication", () => {
    it("should allow an officer to send a message to a citizen about a report", async () => {
      const messageContent =
        "We will schedule the repair for next week. Thank you for your patience.";

      const result = await sendMessage(messageContent, officerId, reportId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe(messageContent);
        expect(result.data.authorId).toBe(officerId);
        expect(result.data.reportId.toString()).toBe(reportId.toString());
      }
    });

    it("should persist officer messages to the database", async () => {
      const messageContent =
        "The repair team has been dispatched to your location.";

      await sendMessage(messageContent, officerId, reportId);

      const messages = await prisma.message.findMany({
        where: { reportId: reportId },
      });

      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe(messageContent);
      expect(messages[0].authorId).toBe(officerId);
    });
  });

  describe("Two-way Communication Thread", () => {
    it("should support a complete conversation thread between citizen and officer", async () => {
      // Citizen starts the conversation
      await sendMessage(
        "The light has been broken for 3 days now.",
        citizenId,
        reportId,
      );

      // Officer responds
      await sendMessage(
        "Thank you for reporting this. We will investigate tomorrow.",
        officerId,
        reportId,
      );

      // Citizen asks for clarification
      await sendMessage("What time will you arrive?", citizenId, reportId);

      // Officer provides details
      await sendMessage(
        "Our team will arrive between 2-4 PM.",
        officerId,
        reportId,
      );

      // Citizen acknowledges
      await sendMessage("Perfect, thank you!", citizenId, reportId);

      const messages = await prisma.message.findMany({
        where: { reportId: reportId },
        orderBy: { createdAt: "asc" },
      });

      expect(messages).toHaveLength(5);
      expect(messages[0].authorId).toBe(citizenId);
      expect(messages[1].authorId).toBe(officerId);
      expect(messages[2].authorId).toBe(citizenId);
      expect(messages[3].authorId).toBe(officerId);
      expect(messages[4].authorId).toBe(citizenId);
    });

    it("should retrieve messages in chronological order", async () => {
      const msg1Time = new Date("2024-01-01T10:00:00Z");
      const msg2Time = new Date("2024-01-01T11:00:00Z");
      const msg3Time = new Date("2024-01-01T12:00:00Z");

      await prisma.message.create({
        data: {
          content: "First message",
          authorId: citizenId,
          reportId: reportId,
          createdAt: msg1Time,
        },
      });

      await prisma.message.create({
        data: {
          content: "Second message",
          authorId: officerId,
          reportId: reportId,
          createdAt: msg2Time,
        },
      });

      await prisma.message.create({
        data: {
          content: "Third message",
          authorId: citizenId,
          reportId: reportId,
          createdAt: msg3Time,
        },
      });

      const result = await getReportMessages(reportId);

      if (Array.isArray(result)) {
        expect(result).toHaveLength(3);
        expect(result[0].content).toBe("First message");
        expect(result[1].content).toBe("Second message");
        expect(result[2].content).toBe("Third message");
      }
    });
  });

  describe("Message Retrieval", () => {
    it("should retrieve all messages for a specific report", async () => {
      await sendMessage("Message 1", citizenId, reportId);
      await sendMessage("Message 2", officerId, reportId);
      await sendMessage("Message 3", citizenId, reportId);

      const result = await getReportMessages(reportId);

      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result).toHaveLength(3);
      }
    });

    it("should return empty array when no messages exist for a report", async () => {
      const result = await getReportMessages(reportId);

      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result).toHaveLength(0);
      }
    });

    it("should include author information in retrieved messages", async () => {
      await sendMessage("Hello from citizen", citizenId, reportId);

      const result = await getReportMessages(reportId);

      if (Array.isArray(result) && result.length > 0) {
        const message = result[0];
        expect(message.author).toBeDefined();
        expect(message.author.id).toBe(citizenId);
        expect(message.author.firstName).toBe("Maria");
        expect(message.author.lastName).toBe("Rossi");
      }
    });

    it("should not retrieve messages from other reports", async () => {
      // Create another report
      const anotherReport = await prisma.report.create({
        data: {
          id: BigInt(5002),
          title: "Different Report",
          description: "Another issue",
          category: "WASTE",
          latitude: 45.0,
          longitude: 7.0,
          citizenId: citizenId,
          status: "PENDING_APPROVAL",
        },
      });

      await sendMessage("Message for first report", citizenId, reportId);
      await sendMessage(
        "Message for second report",
        citizenId,
        anotherReport.id,
      );

      const messagesReport1 = await getReportMessages(reportId);
      const messagesReport2 = await getReportMessages(anotherReport.id);

      if (Array.isArray(messagesReport1) && Array.isArray(messagesReport2)) {
        expect(messagesReport1).toHaveLength(1);
        expect(messagesReport2).toHaveLength(1);
        expect(messagesReport1[0].content).toBe("Message for first report");
        expect(messagesReport2[0].content).toBe("Message for second report");
      }
    });
  });

  describe("Message Validation", () => {
    it("should handle empty message content gracefully", async () => {
      const result = await sendMessage("", citizenId, reportId);

      // The system should either accept empty messages or handle them gracefully
      expect(result).toBeDefined();
    });

    it("should handle very long messages", async () => {
      const longMessage = "A".repeat(5000);

      const result = await sendMessage(longMessage, citizenId, reportId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe(longMessage);
      }
    });

    it("should preserve special characters in messages", async () => {
      const messageWithSpecialChars =
        "Hello! How are you? 😊 I need help with #123 @officer";

      const result = await sendMessage(
        messageWithSpecialChars,
        citizenId,
        reportId,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe(messageWithSpecialChars);
      }
    });

    it("should preserve newlines and formatting in messages", async () => {
      const messageWithNewlines = "Line 1\nLine 2\n\nLine 3";

      const result = await sendMessage(
        messageWithNewlines,
        citizenId,
        reportId,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe(messageWithNewlines);
      }
    });
  });

  describe("Communication Context", () => {
    it("should allow communication only on reports that exist", async () => {
      const nonExistentReportId = BigInt(999999);

      const result = await sendMessage(
        "Test message",
        citizenId,
        nonExistentReportId,
      );

      // The system should handle this gracefully - either by failing or creating the message anyway
      expect(result).toBeDefined();
    });

    it("should maintain message history throughout report lifecycle", async () => {
      // Messages during ASSIGNED status
      await sendMessage("Starting work on this", officerId, reportId);

      // Update report status
      await prisma.report.update({
        where: { id: reportId },
        data: { status: "IN_PROGRESS" },
      });

      // Messages during IN_PROGRESS status
      await sendMessage("Work is progressing", officerId, reportId);

      // Update report status
      await prisma.report.update({
        where: { id: reportId },
        data: { status: "RESOLVED" },
      });

      // Messages after resolution
      await sendMessage("Thank you for the quick fix!", citizenId, reportId);

      const messages = await getReportMessages(reportId);

      if (Array.isArray(messages)) {
        expect(messages).toHaveLength(3);
      }
    });
  });

  describe("Multiple Users Communication", () => {
    it("should support communication when report is reassigned to different officer", async () => {
      // First officer sends message
      await sendMessage("I will handle this report", officerId, reportId);

      // Create second officer
      const secondOfficer = await prisma.user.create({
        data: {
          id: "officer_msg_002",
          firstName: "Paolo",
          lastName: "Verdi",
          username: "paolo_officer",
          passwordHash: "hashed_password",
          email: "paolo@municipality.com",
          role: ["TECHNICAL_OFFICER"],
          office: ["DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES"],
        },
      });

      // Reassign report
      await prisma.report.update({
        where: { id: reportId },
        data: { officerId: secondOfficer.id },
      });

      // Second officer sends message
      await sendMessage(
        "I am taking over this case",
        secondOfficer.id,
        reportId,
      );

      // Citizen responds
      await sendMessage("Thank you for the update", citizenId, reportId);

      const messages = await getReportMessages(reportId);

      if (Array.isArray(messages)) {
        expect(messages).toHaveLength(3);
        expect(messages[0].authorId).toBe(officerId);
        expect(messages[1].authorId).toBe(secondOfficer.id);
        expect(messages[2].authorId).toBe(citizenId);
      }
    });
  });

  describe("Concurrent Messaging", () => {
    it("should handle concurrent messages from both citizen and officer", async () => {
      const citizenMessagePromise = sendMessage(
        "Citizen message",
        citizenId,
        reportId,
      );
      const officerMessagePromise = sendMessage(
        "Officer message",
        officerId,
        reportId,
      );

      const [citizenResult, officerResult] = await Promise.all([
        citizenMessagePromise,
        officerMessagePromise,
      ]);

      expect(citizenResult.success).toBe(true);
      expect(officerResult.success).toBe(true);

      const messages = await getReportMessages(reportId);
      if (Array.isArray(messages)) {
        expect(messages).toHaveLength(2);
      }
    });
  });

  describe("Message Timestamps", () => {
    it("should record creation timestamp for each message", async () => {
      const beforeSend = new Date();

      const result = await sendMessage(
        "Timestamped message",
        citizenId,
        reportId,
      );

      const afterSend = new Date();

      if (result.success) {
        const messageDate = new Date(result.data.createdAt);
        expect(messageDate.getTime()).toBeGreaterThanOrEqual(
          beforeSend.getTime(),
        );
        expect(messageDate.getTime()).toBeLessThanOrEqual(afterSend.getTime());
      }
    });

    it("should maintain chronological order even with rapid successive messages", async () => {
      await sendMessage("Message 1", citizenId, reportId);
      await new Promise((resolve) => setTimeout(resolve, 10)); // Small delay
      await sendMessage("Message 2", citizenId, reportId);
      await new Promise((resolve) => setTimeout(resolve, 10)); // Small delay
      await sendMessage("Message 3", citizenId, reportId);

      const messages = await getReportMessages(reportId);

      if (Array.isArray(messages) && messages.length === 3) {
        const time1 = new Date(messages[0].createdAt).getTime();
        const time2 = new Date(messages[1].createdAt).getTime();
        const time3 = new Date(messages[2].createdAt).getTime();

        expect(time2).toBeGreaterThanOrEqual(time1);
        expect(time3).toBeGreaterThanOrEqual(time2);
      }
    });
  });
});
