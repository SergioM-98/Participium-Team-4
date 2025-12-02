"use server";
import { SendMessageResponse } from "../dtos/message.dto";
import { MessageService } from "../services/message.service";

export async function sendMessage(content: string, authorId: string, reportId: bigint): Promise<SendMessageResponse> {
  try{
    const messageService = MessageService.getInstance();
    return await messageService.sendMessage(content, authorId, reportId);
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: "Failed to send message" };
  }
}

export async function getReportMessages(reportId: bigint) {
  try {
    const messageService = MessageService.getInstance();
    return await messageService.getReportMessages(reportId);
  } catch (error) {
    console.error("Error getting report messages:", error);
    return { success: false, error: "Failed to get report messages" };
  }
}
