import { InlineKeyboard } from "grammy";

const ANONYMOUS_OPTIONS = [
  { text: "Yes", callback_data: "YES" },
  { text: "No", callback_data: "NO" },
];

const anonymousKeyboard = new InlineKeyboard();

for (const option of ANONYMOUS_OPTIONS) {
  anonymousKeyboard.text(option.text, option.callback_data);
}

export { anonymousKeyboard, ANONYMOUS_OPTIONS };
