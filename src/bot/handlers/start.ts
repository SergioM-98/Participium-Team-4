import { Context } from "grammy";

export async function handleStart(ctx: Context) {
  await ctx.reply("Welcome to Participium!");
}
