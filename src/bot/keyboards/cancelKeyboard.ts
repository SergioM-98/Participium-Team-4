import { InlineKeyboard } from "grammy";

export const CANCEL_CALLBACK_DATA = "CANCEL_REPORT";

export const cancelKeyboard = new InlineKeyboard().text(
  "❌ Cancel Report",
  CANCEL_CALLBACK_DATA
);
