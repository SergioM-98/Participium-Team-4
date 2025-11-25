import { Context } from "grammy";
import { helpMenu } from "../menus/helpMenu";

export async function handleHelp(ctx: Context) {
  await ctx.reply("Available commands:", {
    reply_markup: helpMenu,
  });
}
