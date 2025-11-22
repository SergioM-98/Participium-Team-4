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

const token = process.env.TELEGRAM_BOT;

if (!token) {
  throw new Error("TELEGRAM_BOT environment variable is not set");
}

const bot = new Bot<ConversationFlavor<Context>>(token);

bot.use(conversations());
bot.use(createConversation(newReport));

bot.use(helpMenu);

bot.command("start", (ctx) => handleStart(ctx));
bot.command("newreport", (ctx) => ctx.conversation.enter("newReport"));
bot.command("help", (ctx) => handleHelp(ctx));

bot.start();
