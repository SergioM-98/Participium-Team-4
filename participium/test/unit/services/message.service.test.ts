import { MessageService } from "../../../src/app/lib/services/message.service";
import { MessageRepository } from "../../../src/app/lib/repositories/message.repository";
import { NotificationService } from "../../../src/app/lib/services/notification.service";
import { ReportRepository } from "../../../src/app/lib/repositories/report.repository";
import { UserRepository } from "../../../src/app/lib/repositories/user.repository";

jest.mock("@/app/lib/repositories/message.repository", () => ({
  MessageRepository: {
    getInstance: jest.fn(),
  },
}));
jest.mock("@/app/lib/services/notification.service", () => ({
  NotificationService: {
    getInstance: jest.fn(),
  },
}));
jest.mock("@/app/lib/repositories/report.repository", () => ({
  ReportRepository: {
    getInstance: jest.fn(),
  },
}));
jest.mock("@/app/lib/repositories/user.repository", () => ({
  UserRepository: {
    getInstance: jest.fn(),
  },
}));

describe("MessageService story 11", () => {
  let messageService: MessageService;

  const mockMessageRepo = {
    createMessage: jest.fn(),
    getMessagesByReport: jest.fn(),
  };
  const mockNotificationService = {
    notifyNewMessage: jest.fn(),
  };
  const mockReportRepo = {
    getReportById: jest.fn(),
  };
  const mockUserRepo = {
    getUserById: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (MessageRepository.getInstance as jest.Mock).mockReturnValue(mockMessageRepo);
    (NotificationService.getInstance as jest.Mock).mockReturnValue(mockNotificationService);
    (ReportRepository.getInstance as jest.Mock).mockReturnValue(mockReportRepo);
    (UserRepository.getInstance as jest.Mock).mockReturnValue(mockUserRepo);

    messageService = MessageService.getInstance();
  });

  describe("sendMessage", () => {
    const content = "Hello world";
    const reportId = BigInt(100);
    const citizenId = BigInt(50);
    const officerId = BigInt(99);

    const mockMessage = {
      id: BigInt(1),
      content,
      authorId: officerId,
      reportId,
      createdAt: new Date(),
    };

    const mockReport = {
      id: reportId,
      citizenId: citizenId,
      title: "Test Report",
    };

    const mockOfficer = {
      id: officerId,
      username: "OfficerJohn",
      firstName: "John",
      lastName: "Doe",
    };

    it("should create message and notify citizen if author is NOT the citizen", async () => {

      mockMessageRepo.createMessage.mockResolvedValue(mockMessage);
      mockReportRepo.getReportById.mockResolvedValue({ success: true, data: mockReport });
      mockUserRepo.getUserById.mockResolvedValue(mockOfficer);
      mockNotificationService.notifyNewMessage.mockResolvedValue({ success: true });

 
      const result = await messageService.sendMessage(content, officerId, reportId);


      expect(mockMessageRepo.createMessage).toHaveBeenCalledWith({
        content,
        authorId: officerId,
        reportId,
      });
      expect(mockReportRepo.getReportById).toHaveBeenCalledWith(Number(reportId));
      expect(mockUserRepo.getUserById).toHaveBeenCalledWith(officerId);
      

      expect(mockNotificationService.notifyNewMessage).toHaveBeenCalledWith(
        citizenId,
        reportId,
        "John" 
      );
      expect(result).toEqual({
        success: true,
        data: {
          id: mockMessage.id,
          createdAt: mockMessage.createdAt.toISOString(),
          content: mockMessage.content,
          authorId: mockMessage.authorId,
          reportId: mockMessage.reportId,
        },
      });
    });

    it("should create message but NOT notify if author IS the citizen", async () => {
      const messageFromCitizen = { ...mockMessage, authorId: citizenId };
      
      mockMessageRepo.createMessage.mockResolvedValue(messageFromCitizen);
      mockReportRepo.getReportById.mockResolvedValue({ success: true, data: mockReport });
      
      await messageService.sendMessage(content, citizenId, reportId);

      expect(mockMessageRepo.createMessage).toHaveBeenCalled();
      expect(mockNotificationService.notifyNewMessage).not.toHaveBeenCalled();
    });

    it("should fail gracefully (return message) if report fetch fails", async () => {
        mockMessageRepo.createMessage.mockResolvedValue(mockMessage);
        mockReportRepo.getReportById.mockResolvedValue({ success: false });
  
        const result = await messageService.sendMessage(content, officerId, reportId);
  
        expect(result).toEqual({
          success: true,
          data: {
            id: mockMessage.id,
            createdAt: mockMessage.createdAt.toISOString(),
            content: mockMessage.content,
            authorId: mockMessage.authorId,
            reportId: mockMessage.reportId,
          },
        });
        expect(mockNotificationService.notifyNewMessage).not.toHaveBeenCalled();
    });
  });

  describe("getReportMessages", () => {
    it("should return list of messages", async () => {
      const reportId = BigInt(100);
      const messages = [{ id: 1, content: "Test" }];
      mockMessageRepo.getMessagesByReport.mockResolvedValue(messages);

      const result = await messageService.getReportMessages(reportId);

      expect(mockMessageRepo.getMessagesByReport).toHaveBeenCalledWith(reportId);
      expect(result).toEqual(messages);
    });
  });
});