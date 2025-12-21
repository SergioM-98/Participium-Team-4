import { Context } from "grammy";

export async function handleContact(ctx: Context) {
  const contactText =
    "<b>📞 Contact Information</b>\n" +
    "📧 Email: participium.turin@gmail.com\n\n" +
    "<b>Report Issues & Contribute</b>\n" +
    "🐙 GitHub Repository:\n" +
    "github.com/SergioM-98/Participium-Team-4\n\n" +
    "You can open issues on GitHub to report bugs or suggest improvements.\n\n" +
    "<b>About Participium</b>\n" +
    "Participium is a community-driven platform for reporting and tracking urban issues. Help make your city better by reporting problems and staying informed.";

  await ctx.reply(contactText, {
    parse_mode: "HTML",
  });
}
