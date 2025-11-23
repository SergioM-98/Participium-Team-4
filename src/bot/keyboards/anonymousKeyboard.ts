import { InlineKeyboard } from "grammy";

const ANONYMOUS_OPTIONS = [
  { text: "Yes", callback_data: "YES" },
  { text: "No", callback_data: "NO" },
];

function createAnonymousKeyboard(): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  for (const option of ANONYMOUS_OPTIONS) {
    keyboard.text(option.text, option.callback_data);
  }
  return keyboard;
}

const anonymousKeyboard = createAnonymousKeyboard();

export { anonymousKeyboard, ANONYMOUS_OPTIONS, createAnonymousKeyboard };
