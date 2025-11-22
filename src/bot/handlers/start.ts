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
    console.log("handleStart called with chatId:", chatId);

    // Check if user is already authenticated
    const isAuthenticated = await callTelegramApi<AuthenticationCheckResponse>(
      TELEGRAM_API.IS_AUTHENTICATED,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      }
    );

    console.log("Authentication check result:", isAuthenticated);

    if (isAuthenticated.success && isAuthenticated.data) {
      return await ctx.reply(
        formatWelcomeBackMessage(ctx.from?.username ?? isAuthenticated.data)
      );
    }

    // User not authenticated, check if they provided a token
    const messageText = ctx.message?.text || "";
    const authToken = extractAuthTokenFromStartCommand(messageText);

    console.log("Auth token extracted:", authToken);

    if (!authToken) {
      return await ctx.reply(formatAuthInstructionsMessage());
    }

    const telegramInfo: LinkTelegramAccountRequest = {
      authToken,
      chatId,
    };

    console.log("Calling registration API with:", telegramInfo);

    const result = await callTelegramApi<LinkTelegramAccountResponse>(
      TELEGRAM_API.REGISTER,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telegramInfo),
      }
    );

    console.log("Registration API result:", result);

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
