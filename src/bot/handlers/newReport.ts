import { Conversation } from "@grammyjs/conversations";
import { Context } from "grammy";
import { Report, Category } from "../../app/lib/dtos/report.dto";
import { categoryKeyboard } from "../keyboards/categoryKeyboard";
import { Keyboard } from "grammy";

const QUESTIONS = [
  "Please provide the title of the report:",
  "Please describe the problem in detail:",
  "What is the category of the report?",
  "Please share your location. Use the button for your current position, or the attachment menu (📎) to pick a point on the map:",
  "Please attach any photos (up to 3).",
];

export async function newReport(
  conversation: Conversation<Context>,
  ctx: Context
) {
  await ctx.reply(QUESTIONS[0]);

  const title = await conversation.form.text();

  await ctx.reply(QUESTIONS[1]);
  const description = await conversation.form.text();

  await ctx.reply(QUESTIONS[2], { reply_markup: categoryKeyboard });
  const categoryCtx = await conversation.waitFor("callback_query:data");
  const categoryResponse = categoryCtx.callbackQuery?.data as Category;

  const locationKeyboard = new Keyboard()
    .requestLocation("📍 Share my location (Mobile only)")
    .resized()
    .oneTime();

  await ctx.reply(QUESTIONS[3], {
    reply_markup: locationKeyboard,
  });

  const location = await conversation.form.location({
    otherwise: async (ctx) => {
      await ctx.reply(
        "Please share your location using the button or the attachment menu."
      );
    },
  });

  const photos = [];
  const MAX_PHOTOS = 3;

  await ctx.reply(QUESTIONS[4], {
    reply_markup: { remove_keyboard: true },
  });

  while (photos.length < MAX_PHOTOS) {
    const nextCtx = await conversation.waitFor("message");
    const message = nextCtx.message;

    if (message.text === "/done") {
      break;
    }

    if (message.photo) {
      photos.push(message.photo);
      await ctx.reply(`Photo ${photos.length}/${MAX_PHOTOS} received`);

      if (photos.length < MAX_PHOTOS) {
        await ctx.reply("Send another photo or /done to finish");
      }
    } else {
      await ctx.reply("Please send a photo or /done to finish.");
    }
  }

  await ctx.reply(`Received ${photos.length} photos in total!`);

  // Build report data
  const reportData: Partial<Report> = {
    title,
    description,
    latitude: location.latitude,
    longitude: location.longitude,
    category: categoryResponse,
    photos: [],
  };

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
      await ctx.reply(`Report sent successfully!`);
    } else {
      await ctx.reply("Error sending the report. Please try again later.");
    }
  } catch (error) {
    console.error("Error sending the report:", error);
    await ctx.reply("Connection error. Please try again later.");
  }
}
