import { MessageRepository } from "../repositories/message.repository";
import { NotificationService } from "./notification.service";
import { ReportRepository } from "../repositories/report.repository";
import { UserRepository } from "../repositories/user.repository";

class MessageService {
  private static instance: MessageService;
  private messageRepository: MessageRepository;
  private notificationService: NotificationService;
  private reportRepository: ReportRepository;
  private userRepository: UserRepository;

  private constructor() {
    this.messageRepository = MessageRepository.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.reportRepository = ReportRepository.getInstance();
    this.userRepository = UserRepository.getInstance();
  }

  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  public async sendMessage(content: string, authorId: string, reportId: bigint) {
    const message = await this.messageRepository.createMessage({ content, authorId, reportId });

    try {
      // Get report to find the citizen
      const reportResult = await this.reportRepository.getReportById(Number(reportId));
      //should throw errori if not found and go in catch
      const report = reportResult.data;

      // Get author info for notification message
      const author = await this.userRepository.getUserById(authorId);
      const authorName = author?.firstName || author?.username || "Someone";

      // If the author is NOT the citizen (i.e., it's an officer), notify the citizen
      if (authorId !== report.citizenId) {
        await this.notificationService.notifyNewMessage(
          report.citizenId,
          reportId,
          authorName
        );
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      // Don't fail the message creation if notification fails
    }

    return message;
  }

  public async getReportMessages(reportId: bigint) {
    return this.messageRepository.getMessagesByReport(reportId);
  }
}

export { MessageService };
