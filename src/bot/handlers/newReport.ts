import { Conversation } from "@grammyjs/conversations";
import { Context } from "grammy";
import { Report, Category } from "../../app/lib/dtos/report.dto";
import { categoryMenu } from "../menus/categoryMenu";

const QUESTIONS = [
  "Please provide the title of the report:",
  "Please describe the problem in detail:",
  "Insert latitude",
  "Insert longitude",
  "What is the category of the report?",
];

const FIELD_NAMES = [
  "title",
  "description",
  "latitude",
  "longitude",
  "category",
];

const CATEGORY_CONFIG: Array<{
  value: Category;
  label: string;
}> = [
  { value: "WATER_SUPPLY", label: "Water Supply" },
  {
    value: "ARCHITECTURAL_BARRIERS",
    label: "Architectural Barriers",
  },
  { value: "SEWER_SYSTEM", label: "Sewer System" },
  { value: "PUBLIC_LIGHTING", label: "Public Lighting" },
  { value: "WASTE", label: "Waste" },
  {
    value: "ROADS_SIGNS_AND_TRAFFIC_LIGHTS",
    label: "Roads, Signs & Traffic Lights",
  },
  {
    value: "ROADS_AND_URBAN_FURNISHINGS",
    label: "Roads & Urban Furnishings",
  },
  {
    value: "PUBLIC_GREEN_AREAS_AND_BACKGROUNDS",
    label: "Green Areas",
  },
  { value: "OTHER", label: "Other" },
];

export async function newReport(
  conversation: Conversation<Context>,
  ctx: Context
) {
  await ctx.reply(QUESTIONS[0]);

  const title = await conversation.form.text();

  await ctx.reply(QUESTIONS[1]);
  const description = await conversation.form.text();

  await ctx.reply(QUESTIONS[2]);
  const latitudeValue = await conversation.form.text();
  const latitude = parseFloat(latitudeValue) || 0;

  // Get longitude
  await ctx.reply(QUESTIONS[3]);
  const longitudeValue = await conversation.form.text();
  const longitude = parseFloat(longitudeValue) || 0;

  await ctx.reply(QUESTIONS[4]);
  const categoryLabels = CATEGORY_CONFIG.map(({ label }) => label);
  const categoryResponse = await conversation.form.select(categoryLabels, {
    otherwise: (ctx) => ctx.reply("Please use one of the buttons!"),
  });

  // Build report data
  const reportData: Partial<Report> = {
    title,
    description,
    latitude,
    longitude,
    category:
      CATEGORY_CONFIG.find(({ label }) => label === categoryResponse)?.value ||
      "OTHER",
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
      await ctx.reply(`✅ Report sent successfully! ID: ${result.id}`);
    } else {
      await ctx.reply("❌ Error sending the report. Please try again later.");
    }
  } catch (error) {
    console.error("Error sending the report:", error);
    await ctx.reply("❌ Connection error. Please try again later.");
  }
}
