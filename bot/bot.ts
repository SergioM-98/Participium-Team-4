import { Bot, Context } from "grammy";
import {
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";
import * as dotenv from "dotenv";
import { resolve } from "path";
import { helpMenu } from "./menus/helpMenu";
import { handleStart } from "./handlers/start";
import { newReport } from "./handlers/newReport";
import { handleHelp } from "./handlers/help";

dotenv.config({ path: resolve(__dirname, "../../.env.bot") });

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error("BOT_TOKEN environment variable is not set");
}

const bot = new Bot<ConversationFlavor<Context>>(token);

function logBot(message: string, data?: unknown): void {
  const timestamp = new Date().toISOString();
}

bot.catch((error) => {
  logBot("Unhandled error in bot", {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
});

bot.use(conversations());
bot.use(createConversation(newReport));
bot.use(helpMenu);

bot.command("start", async (ctx) => {
  try {
    await handleStart(ctx);
  } catch (error) {
    await ctx.reply(
      "An error occurred while processing your request. Please try again."
    );
  }
});

bot.command("newreport", async (ctx) => {
  try {
    await ctx.conversation.enter("newReport");
  } catch (error) {
    await ctx.reply(
      "An error occurred while starting the report. Please try again."
    );
  }
});

bot.command("help", async (ctx) => {
  try {
    await handleHelp(ctx);
  } catch (error) {
    await ctx.reply(
      "An error occurred while retrieving help. Please try again."
    );
  }
});

bot.on("message", async (ctx) => {
  if (!ctx.message.text?.startsWith("/")) {
    await ctx.reply(
      "I didn't understand that command. Use /help to see available commands."
    );
  }
});

async function shutdown(signal: string): Promise<void> {
  logBot(`Received ${signal} signal, shutting down gracefully...`);
  try {
    await bot.stop();
    logBot("Bot stopped successfully");
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

async function startBot(): Promise<void> {
  try {
    logBot("Starting Telegram bot...");
    await bot.start();
    logBot("Bot started successfully");
  } catch (error) {
    logBot("Failed to start bot", error);
    process.exit(1);
  }
}

startBot();
