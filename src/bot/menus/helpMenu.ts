import { Menu } from "@grammyjs/menu";
import { handleStart } from "../handlers/start";
import { handleHelp } from "../handlers/help";

export const helpMenu = new Menu("help_menu")
  .text("Start", handleStart)
  .row()
  .text("New Report", (ctx: any) => ctx.conversation.enter("newReport"))
  .row()
  .text("Help", handleHelp);
