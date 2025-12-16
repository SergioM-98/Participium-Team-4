import { Context } from "grammy";
import {
  callTelegramApi,
  formatAuthErrorMessage,
  TELEGRAM_API,
} from "../utils/telegram.utils";
import {
  formatReportDetail,
  sendReportPhotos,
  buildErrorMessage,
} from "../utils/reportUtils";
import { AuthenticationCheckResponse } from "../dtos/telegram.dto";
import { ReportDetailResponse } from "../dtos/report.dto";

async function validateInput(
  ctx: Context,
  text: string,
): Promise<string | null> {
  const parts = text.split(" ");

  if (parts.length < 2) {
    await ctx.reply(
      "❌ Usage: /report [report_id]\n\nPlease provide a report ID to view its details.",
    );
    return null;
  }

  const reportId = parts[1].trim();
  if (!reportId) {
    await ctx.reply(
      "❌ Please provide a valid report ID.\n\nExample: /report abc123xyz",
    );
    return null;
  }

  return reportId;
}

async function checkAuthentication(
  ctx: Context,
  chatId: number,
): Promise<boolean> {
  const isAuthenticated = await callTelegramApi<AuthenticationCheckResponse>(
    TELEGRAM_API.IS_AUTHENTICATED,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId }),
    },
  );

  if (!isAuthenticated.success || !isAuthenticated.data) {
    await ctx.reply(
      formatAuthErrorMessage(
        "You need to authenticate first. Go to Participium's website to link your account.",
      ),
    );
  }

  return isAuthenticated.success && !!isAuthenticated.data;
}

async function handleSuccessResponse(
  ctx: Context,
  response: ReportDetailResponse,
  reportId: string,
): Promise<void> {
  if (response.success && response.data && response.data.length > 0) {
    const report = response.data[0];
    const details = formatReportDetail(report);
    await ctx.reply(details, { parse_mode: "HTML" });
    await sendReportPhotos(ctx, report.id, report.photos || []);
  } else if (response.success) {
    await ctx.reply(
      `❌ Report not found.\n\nThe report ID "<code>${reportId}</code>" doesn't exist or you don't have access to it.`,
      { parse_mode: "HTML" },
    );
  }
}

async function handleErrorResponse(
  ctx: Context,
  response: ReportDetailResponse,
  reportId: string,
): Promise<void> {
  if (!response.success && response.error) {
    const userMessage = buildErrorMessage(response.error, reportId);
    await ctx.reply(userMessage, { parse_mode: "HTML" });
  }
}

export async function handleReportCommand(ctx: Context) {
  try {
    const text = ctx.message?.text || "";
    const reportId = await validateInput(ctx, text);

    if (!reportId) return;

    const chatId = ctx.chatId!;
    const isAuthenticated = await checkAuthentication(ctx, chatId);

    if (!isAuthenticated) return;

    const reportEndpoint =
      TELEGRAM_API.REPORT_DETAIL + `/${reportId}?chatId=${chatId}`;

    const response = await callTelegramApi<ReportDetailResponse>(
      reportEndpoint,
      { method: "GET" },
    );

    if (response.success) {
      await handleSuccessResponse(ctx, response, reportId);
    } else {
      await handleErrorResponse(ctx, response, reportId);
    }
  } catch (error) {
    console.log("Error in /report command:", error);
    await ctx.reply(
      "An unexpected error occurred. Please try again later or contact support.",
    );
  }
}
