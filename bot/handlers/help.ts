import { Context } from "grammy";
import { helpMenu } from "../menus/helpMenu";

export async function handleHelp(ctx: Context) {
  const helpText =
    "<b>📱 Available Commands</b>\n\n" +
    "<b>/start</b>\n" +
    "Link your Telegram account to your citizen account.\n\n" +
    "<b>/report</b>\n" +
    "Create a new report about a problem in your area.\n\n" +
    "<b>/myreports</b>\n" +
    "View all your submitted reports with pagination (5 per page).\n\n" +
    "<b>/report &lt;ID&gt;</b>\n" +
    "View detailed information about a specific report.\n\n" +
    "<b>/faq</b>\n" +
    "Read frequently asked questions.\n\n" +
    "<b>/contact</b>\n" +
    "Get contact information for municipality support.\n\n" +
    "<b>/help</b>\n" +
    "Show this help menu with available commands.\n\n" +
    "👇 <b>Use the buttons below for more details</b>";

  await ctx.reply(helpText, {
    parse_mode: "HTML",
    reply_markup: helpMenu,
  });
}
