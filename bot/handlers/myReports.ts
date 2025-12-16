import { Context, InlineKeyboard } from "grammy";
import {
  callTelegramApi,
  formatAuthErrorMessage,
  TELEGRAM_API,
} from "../utils/telegram.utils";
import {
  formatReportItem,
  formatReportsSummary,
  REPORTS_PER_PAGE,
} from "../utils/reportUtils";
import { createPaginationKeyboard } from "../keyboards/myReportsKeyboard";
import { AuthenticationCheckResponse } from "../dtos/telegram.dto";
import { ReportsByCitizenResponse, CitizenReport } from "../dtos/report.dto";

interface PageContent {
  text: string;
  keyboard: InlineKeyboard;
}

function renderReportsPage(
  reports: CitizenReport[],
  page: number,
  totalPages: number,
): PageContent {
  const startIndex = (page - 1) * REPORTS_PER_PAGE;
  const endIndex = startIndex + REPORTS_PER_PAGE;
  const pageReports = reports.slice(startIndex, endIndex);

  const message = pageReports
    .map((report, index) => formatReportItem(report, startIndex + index + 1))
    .join("\n\n");

  const keyboard = createPaginationKeyboard(page, totalPages);
  const text = `<b>📋 Your Reports (Page ${page}/${totalPages})</b>\n\n${message}`;

  return { text, keyboard };
}

export async function handleMyReports(ctx: Context) {
  try {
    const chatId = ctx.chatId!;

    const isAuthenticated = await callTelegramApi<AuthenticationCheckResponse>(
      TELEGRAM_API.IS_AUTHENTICATED,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      },
    );

    if (isAuthenticated.success && isAuthenticated.data) {
      const response = await callTelegramApi<ReportsByCitizenResponse>(
        TELEGRAM_API.MY_REPORTS + `?chatId=${chatId}`,
        {
          method: "GET",
        },
      );

      if (response.success) {
        const reports = response.data;

        if (reports.length === 0) {
          await ctx.reply("📭 You haven't created any reports yet.");
          return;
        }

        const summary = formatReportsSummary(reports);
        await ctx.reply(summary, { parse_mode: "HTML" });

        const totalPages = Math.ceil(reports.length / REPORTS_PER_PAGE);
        await showReportsPage(ctx, reports, 1, totalPages);
      } else {
        await ctx.reply(formatAuthErrorMessage(response.error));
      }
    } else {
      await ctx.reply(
        `⚠️ Authentication failed: ${isAuthenticated.success}\n\nMake sure you have linked your Telegram account from the Participium website using /start command.`,
      );
    }
  } catch (error) {
    console.log("Error in /myreports command:", error);
    await ctx.reply(
      "An unexpected error occurred. Please try again later or contact support.",
    );
  }
}

export async function showReportsPage(
  ctx: Context,
  reports: CitizenReport[],
  page: number,
  totalPages: number,
) {
  const pageContent = renderReportsPage(reports, page, totalPages);
  await ctx.reply(pageContent.text, {
    parse_mode: "HTML",
    reply_markup: pageContent.keyboard,
  });
}

export async function handlePaginationCallback(
  ctx: Context,
  reports: CitizenReport[],
  page: number,
) {
  const totalPages = Math.ceil(reports.length / REPORTS_PER_PAGE);

  if (page < 1 || page > totalPages) {
    await ctx.answerCallbackQuery({
      text: "Invalid page",
      show_alert: false,
    });
    return;
  }

  const pageContent = renderReportsPage(reports, page, totalPages);
  await ctx.editMessageText(pageContent.text, {
    parse_mode: "HTML",
    reply_markup: pageContent.keyboard,
  });

  await ctx.answerCallbackQuery();
}
