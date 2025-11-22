import { Context } from "grammy";
import {
  callTelegramApi,
  extractAuthTokenFromStartCommand,
  formatAuthErrorMessage,
  formatAuthInstructionsMessage,
  formatWelcomeBackMessage,
  formatWelcomeMessage,
  TELEGRAM_API,
} from "../utils/telegram.utils";
import {
  AuthenticationCheckResponse,
  LinkTelegramAccountRequest,
  LinkTelegramAccountResponse,
} from "@/dtos/telegram.dto";

export async function handleStart(ctx: Context) {
  try {
    const chatId = ctx.chatId!;

    const isAuthenticated = await callTelegramApi<AuthenticationCheckResponse>(
      TELEGRAM_API.IS_AUTHENTICATED,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      }
    );

    if (isAuthenticated.success && isAuthenticated.data) {
      return await ctx.reply(
        formatWelcomeBackMessage(ctx.from?.username ?? isAuthenticated.data)
      );
    }

    const messageText = ctx.message?.text || "";
    const authToken = extractAuthTokenFromStartCommand(messageText);

    if (!authToken) {
      return await ctx.reply(formatAuthInstructionsMessage());
    }

    const telegramInfo: LinkTelegramAccountRequest = {
      authToken,
      chatId,
    };

    const result = await callTelegramApi<LinkTelegramAccountResponse>(
      TELEGRAM_API.REGISTER,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telegramInfo),
      }
    );

    if (result.success) {
      await ctx.reply(formatWelcomeMessage(result.data));
    } else {
      await ctx.reply(formatAuthErrorMessage(result.error));
    }
  } catch (error) {
    console.error("Error in handleStart:", error);
    await ctx.reply(
      "An unexpected error occurred. Please try again later or contact support."
    );
  }
}
