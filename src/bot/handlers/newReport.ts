import { Conversation } from "@grammyjs/conversations";
import { Context } from "grammy";
import { Report } from "../../app/lib/dtos/report.dto";

const QUESTIONS = [
  "Please provide the title of the report:",
  "Please describe the problem in detail:",
  "What is the location/address?",
  "What is the category of the report?",
];

const FIELD_NAMES = [
  "title",
  "description",
  "latitude",
  "longitude",
  "category",
];

export async function newReport(
  conversation: Conversation<Context>,
  ctx: Context
) {
  const reportData: Partial<Report> = {};

  for (let i = 0; i < QUESTIONS.length; i++) {
    await ctx.reply(QUESTIONS[i]);
    const nextCtx = await conversation.wait();
    const fieldName = FIELD_NAMES[i];
    const value = nextCtx.message?.text || "";

    switch (fieldName) {
      case "title":
        reportData.title = value;
        break;
      case "description":
        reportData.description = value;
        break;
      case "latitude":
        reportData.latitude = 0; // TODO: Implement map integration to get real coordinates
        break;
      case "longitude":
        reportData.longitude = 0; // TODO: Implement map integration to get real coordinates
        break;
      case "category":
        reportData.category = value as Report["category"]; // Devo fornire agli utenti dei bottoni tra cui poter scegliere la categoria
        break;
    }

    ctx = nextCtx;
  }

  // TODO: Handle photos - for now empty array
  reportData.photos = [];

  await ctx.reply("Sending your report...");

  try {
    const response = await fetch("http://localhost:3000/api/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reportData),
    });

    if (response.ok) {
      const result = await response.json();
      await ctx.reply(`✅ Report sent successfully! ID: ${result.id}`);
    } else {
      await ctx.reply("❌ Error sending the report. Please try again later.");
    }
  } catch (error) {
    console.error("Error sending the report:", error);
    await ctx.reply("❌ Connection error. Please try again later.");
  }
}
