import { Bot, Context } from "grammy";
import {
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";
import * as dotenv from "dotenv";
import { join } from "node:path";
import { helpMenu } from "./menus/helpMenu";
import { handleStart } from "./handlers/start";
import { newReport } from "./handlers/newReport";
import { handleHelp } from "./handlers/help";
import {
  handleMyReports,
  handlePaginationCallback,
} from "./handlers/myReports";
import {
  logBot,
  shutdown,
  startBot,
  callTelegramApi,
  formatAuthErrorMessage,
} from "./utils/telegram.utils";
import { AuthenticationCheckResponse } from "./dtos/telegram.dto";
import { ReportsByCitizenResponse } from "./dtos/report.dto";

const rootEnvPath = join(__dirname, "..", ".env");
dotenv.config({ path: rootEnvPath });

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error("BOT_TOKEN environment variable is not set");
}

const bot = new Bot<ConversationFlavor<Context>>(token);

try {
  logBot("Bot initialized successfully");

  bot.use(conversations());
  bot.use(createConversation(newReport));
  bot.use(helpMenu);

  bot.command("start", async (ctx) => {
    try {
      await handleStart(ctx);
    } catch (error) {
      console.log("Error in /start command:", error);
      await ctx.reply(
        "An error occurred while processing your request. Please try again.",
      );
    }
  });

  bot.command("newreport", async (ctx) => {
    try {
      await ctx.conversation.enter("newReport");
    } catch (error) {
      console.log("Error in /newreport command:", error);
      await ctx.reply(
        "An error occurred while starting the report. Please try again.",
      );
    }
  });

  bot.command("help", async (ctx) => {
    try {
      await handleHelp(ctx);
    } catch (error) {
      console.log("Error in /help command:", error);
      await ctx.reply(
        "An error occurred while retrieving help. Please try again.",
      );
    }
  });

  bot.command("myreports", async (ctx) => {
    try {
      await handleMyReports(ctx);
    } catch (error) {
      console.log("Error in /myreports command:", error);
      await ctx.reply(
        "An error occurred while retrieving your reports. Please try again.",
      );
    }
  });

  bot.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery?.data;

    if (data?.startsWith("myreports_page_")) {
      try {
        const pageMatch = new RegExp(/myreports_page_(\d+)/).exec(data);
        if (!pageMatch) {
          return;
        }

        const page = Number.parseInt(pageMatch[1], 10);
        const chatId = ctx.chatId!;

        // Check authentication
        const authEndpoint =
          process.env.TELEGRAM_API_IS_AUTHENTICATED ||
          "/api/telegram/isAuthenticated";

        const isAuthenticated =
          await callTelegramApi<AuthenticationCheckResponse>(authEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chatId }),
          });

        if (!isAuthenticated.success || !isAuthenticated.data) {
          await ctx.reply(
            formatAuthErrorMessage("You need to authenticate first."),
          );
          return;
        }

        // Fetch reports
        const reportsEndpoint =
          (process.env.TELEGRAM_API_MY_REPORTS || "/api/telegram/reports") +
          `?chatId=${chatId}`;

        const response = await callTelegramApi<ReportsByCitizenResponse>(
          reportsEndpoint,
          { method: "GET" },
        );

        if (response.success) {
          await handlePaginationCallback(ctx, response.data, page);
        } else {
          await ctx.reply(formatAuthErrorMessage(response.error));
        }
      } catch (error) {
        console.log("Error in pagination callback:", error);
        await ctx.answerCallbackQuery({
          text: "An error occurred",
          show_alert: true,
        });
      }
    } else if (data === "myreports_page_noop") {
      await ctx.answerCallbackQuery({
        text: "You are already on this page",
        show_alert: false,
      });
    }
  });

  bot.on("message", async (ctx) => {
    if (!ctx.message.text?.startsWith("/")) {
      await ctx.reply(
        "I didn't understand that command. Use /help to see available commands.",
      );
    }
  });

  process.on("SIGINT", () => shutdown(bot, "SIGINT"));
  process.on("SIGTERM", () => shutdown(bot, "SIGTERM"));

  startBot(bot);
} catch (error) {
  logBot("Failed to initialize bot", error);
  process.exit(1);
}
