import { prisma } from "@/prisma/db";
import { Message } from "@prisma/client";

export class MessageRepository {
    private static instance: MessageRepository;

    private constructor() { }

    public static getInstance(): MessageRepository {
        if (!MessageRepository.instance) {
            MessageRepository.instance = new MessageRepository();
        }
        return MessageRepository.instance;
    }

    public async createMessage(data: { content: string; authorId: string; reportId: bigint }): Promise<Message> {
        return prisma.message.create({ data });
    }

    public async getMessagesByReport(reportId: bigint): Promise<Message[]> {
        return prisma.message.findMany({
            where: { reportId },
            orderBy: { createdAt: 'asc' },
            include: { author: true },
        });
    }
}
