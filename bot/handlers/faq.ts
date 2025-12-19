import { Context } from "grammy";

export async function handleFaq(ctx: Context) {
  const faqText =
    "<b>❓ Frequently Asked Questions</b>\n\n" +
    "<b>Q: How do I create a report?</b>\n" +
    "A: Use the /report command and fill in the required details. You'll need to provide a title, description, category, and location.\n\n" +
    "<b>Q: Can I see the status of my reports?</b>\n" +
    "A: Yes! Use /myreports to view all your submitted reports and their current status.\n\n" +
    "<b>Q: What statuses can my report have?</b>\n" +
    "A: Pending Approval → Assigned → In Progress → Resolved or Rejected.\n\n" +
    "<b>Q: Can I add photos to my report?</b>\n" +
    "A: Yes, you can attach up to 3 photos when creating a report to help illustrate the issue.\n\n" +
    "<b>Q: Is my report private?</b>\n" +
    "A: You can submit reports anonymously. Keep in mind that your name is still visible to authorized staff.";

  await ctx.reply(faqText, {
    parse_mode: "HTML",
  });
}
