import { InlineKeyboard } from "grammy";

export function createPaginationKeyboard(
  currentPage: number,
  totalPages: number,
): InlineKeyboard {
  const buttons: Array<Array<{ text: string; callback_data: string }>> = [];
  const navButtons: Array<{ text: string; callback_data: string }> = [];

  if (currentPage > 1) {
    navButtons.push({
      text: "⬅️ Previous",
      callback_data: `myreports_page_${currentPage - 1}`,
    });
  }

  if (currentPage < totalPages) {
    navButtons.push({
      text: "Next ➡️",
      callback_data: `myreports_page_${currentPage + 1}`,
    });
  }

  if (navButtons.length > 0) {
    buttons.push(navButtons);
  }

  return new InlineKeyboard(buttons);
}
