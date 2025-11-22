import { Context } from "grammy";
import {
  extractAuthTokenFromStartCommand,
  formatAuthErrorMessage,
  formatAuthInstructionsMessage,
  formatWelcomeBackMessage,
  formatWelcomeMessage,
} from "../utils/telegramAuth.utils";
import {
  LinkTelegramAccountRequest,
  LinkTelegramAccountResponse,
} from "@/app/lib/dtos/telegram.dto";

export async function handleStart(ctx: Context) {
  try {
    const chatId = ctx.chatId!;

    const isAuthenticated = await fetch(
      `${process.env.BACKEND_URL}/api/telegram/isAuthenticated?chatId=${chatId}`
    ).then((res) => res.json());

    if (isAuthenticated) {
      return await ctx.reply(
        formatWelcomeBackMessage(
          ctx.from?.username ?? isAuthenticated.data.username
        )
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
      username: ctx.from?.username ?? "",
    };

    const result: LinkTelegramAccountResponse = await fetch(
      `${process.env.BACKEND_URL}/api/telegram/auth`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telegramInfo),
      }
    ).then((res) => res.json());

    if (result.success) {
      await ctx.reply(formatWelcomeMessage(result.data));
    } else {
      await ctx.reply(formatAuthErrorMessage(result.error));
    }
  } catch (error) {
    await ctx.reply("An unexpected error occurred. Please try again later.");
  }
}
