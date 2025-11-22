import { MessageRepository } from "@/repositories/message.repository";

class MessageService {
  private static instance: MessageService;
  private messageRepository: MessageRepository;

  private constructor() {
    this.messageRepository = MessageRepository.getInstance();
  }

  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  public async sendMessage(content: string, authorId: bigint, reportId: bigint) {
    return this.messageRepository.createMessage({ content, authorId, reportId });
  }

  public async getReportMessages(reportId: bigint) {
    return this.messageRepository.getMessagesByReport(reportId);
  }
}

export { MessageService };
