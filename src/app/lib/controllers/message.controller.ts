"use server";
import { MessageService } from "@/services/message.service";

export async function sendMessage(content: string, authorId: bigint, reportId: bigint) {
  const messageService = MessageService.getInstance();
  return await messageService.sendMessage(content, authorId, reportId);
}

export async function getReportMessages(reportId: bigint) {
  const messageService = MessageService.getInstance();
  return await messageService.getReportMessages(reportId);
}
