import { MessageRepository } from "../../../src/app/lib/repositories/message.repository";

jest.mock("@/prisma/db", () => ({
  prisma: {
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const mockedPrisma = jest.requireMock("@/prisma/db").prisma;

describe("MessageRepository story 11", () => {
  let messageRepository: MessageRepository;

  const mockMessageData = {
    content: "Test message content",
    authorId: BigInt(1),
    reportId: BigInt(100),
  };

  const mockCreatedMessage = {
    id: BigInt(50),
    ...mockMessageData,
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    messageRepository = MessageRepository.getInstance();
  });

  describe("createMessage", () => {
    it("should create a message successfully", async () => {
      mockedPrisma.message.create.mockResolvedValue(mockCreatedMessage);

      const response = await messageRepository.createMessage(mockMessageData);

      expect(mockedPrisma.message.create).toHaveBeenCalledWith({
        data: mockMessageData,
      });
      expect(response).toEqual(mockCreatedMessage);
    });

    it("should throw an error when database creation fails", async () => {
      mockedPrisma.message.create.mockRejectedValue(new Error("DB Error"));

      await expect(messageRepository.createMessage(mockMessageData)).rejects.toThrow("DB Error");
    });
  });

  describe("getMessagesByReport", () => {
    it("should return messages for a report ordered by date", async () => {
      const mockMessagesList = [
        { ...mockCreatedMessage, id: BigInt(50) },
        { ...mockCreatedMessage, id: BigInt(51), content: "Second message" },
      ];

      mockedPrisma.message.findMany.mockResolvedValue(mockMessagesList);

      const response = await messageRepository.getMessagesByReport(mockMessageData.reportId);

      expect(mockedPrisma.message.findMany).toHaveBeenCalledWith({
        where: { reportId: mockMessageData.reportId },
        orderBy: { createdAt: 'asc' },
        include: { author: true },
      });
      expect(response).toEqual(mockMessagesList);
      expect(response).toHaveLength(2);
    });

    it("should return empty array if no messages found", async () => {
      mockedPrisma.message.findMany.mockResolvedValue([]);

      const response = await messageRepository.getMessagesByReport(mockMessageData.reportId);

      expect(response).toEqual([]);
    });
  });
});