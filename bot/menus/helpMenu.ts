import { Menu } from "@grammyjs/menu";
import { handleStart } from "../handlers/start";
import { handleHelp } from "../handlers/help";
import { handleContact } from "../handlers/contact";
import { handleFaq } from "../handlers/faq";

export const helpMenu = new Menu("help_menu")
  .text("🔗 Link Account", handleStart)
  .row()
  .text("📋 View My Reports", (ctx: any) => {
    ctx.reply(
      "<b>📋 /myreports</b>\n\n" +
        "Shows all reports you've created with a paginated view (5 reports per page).\n\n" +
        "Use the navigation buttons to browse through your reports.",
      { parse_mode: "HTML" },
    );
  })
  .row()
  .text("📝 Create Report", (ctx: any) => ctx.conversation.enter("newReport"))
  .row()
  .text("🔍 View Report Details", (ctx: any) => {
    ctx.reply(
      "<b>🔍 /report &lt;ID&gt;</b>\n\n" +
        "Shows detailed information about a specific report.\n\n" +
        "<b>Example:</b> /report abc123xyz\n\n" +
        "Displays:\n" +
        "• Report title\n" +
        "• Full description\n" +
        "• Category\n" +
        "• Location coordinates\n" +
        "• Current status\n" +
        "• Attached photos",
      { parse_mode: "HTML" },
    );
  })
  .row()
  .text("❓ FAQ", handleFaq)
  .row()
  .text("📞 Contact Support", handleContact)
  .row()
  .text("ℹ️ Help", handleHelp);
