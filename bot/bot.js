"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var grammy_1 = require("grammy");
var conversations_1 = require("@grammyjs/conversations");
var dotenv = require("dotenv");
var path_1 = require("path");
var helpMenu_1 = require("./menus/helpMenu");
var categoryMenu_1 = require("./menus/categoryMenu");
var start_1 = require("./handlers/start");
var newReport_1 = require("./handlers/newReport");
var help_1 = require("./handlers/help");
dotenv.config({ path: (0, path_1.resolve)(__dirname, "../../.env.bot") });
var token = process.env.TELEGRAM_TOKEN;
if (!token) {
    throw new Error("TELEGRAM_TOKEN environment variable is not set");
}
var bot = new grammy_1.Bot(token);
bot.use((0, conversations_1.conversations)());
bot.use((0, conversations_1.createConversation)(newReport_1.newReport));
bot.use(helpMenu_1.helpMenu);
bot.use(categoryMenu_1.categoryMenu);
bot.command("start", function (ctx) { return (0, start_1.handleStart)(ctx); });
bot.command("newreport", function (ctx) { return ctx.conversation.enter("newReport"); });
bot.command("help", function (ctx) { return (0, help_1.handleHelp)(ctx); });
bot.start();
