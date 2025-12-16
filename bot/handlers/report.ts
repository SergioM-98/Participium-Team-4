import { Context, InputFile } from "grammy";
import {
  callTelegramApi,
  formatAuthErrorMessage,
  TELEGRAM_API,
} from "../utils/telegram.utils";
import { getStatusEmoji, toTitleCase } from "../utils/reportUtils";
import { AuthenticationCheckResponse } from "../dtos/telegram.dto";
import { CitizenReport } from "../dtos/report.dto";

interface ReportDetailResponse {
  success: boolean;
  data?: CitizenReport[];
  error?: string;
}

function formatReportDetail(report: CitizenReport): string {
  const emoji = getStatusEmoji(report.status);
  const statusLabel = toTitleCase(report.status || "pending");

  let details = `<b>📋 Report Details</b>\n\n`;
  details += `<b>Title:</b> ${escapeHtml(report.title)}\n`;
  details += `<b>ID:</b> <code>${report.id}</code>\n`;
  details += `<b>Status:</b> ${emoji} ${statusLabel}\n\n`;

  details += `<b>Description:</b>\n${escapeHtml(report.description)}\n\n`;

  if (report.category) {
    details += `<b>Category:</b> ${escapeHtml(report.category)}\n`;
  }

  if (report.longitude && report.latitude) {
    details += `<b>Location:</b> <code>${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}</code>\n`;
  }

  if (report.photos && report.photos.length > 0) {
    details += `\n<b>Photos:</b> ${report.photos.length} image(s) attached`;
  }

  return details;
}

function escapeHtml(text: string | undefined): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function downloadAndSendPhoto(
  ctx: Context,
  photoUrl: string,
  reportId: string,
): Promise<boolean> {
  try {
    console.log(`[Report] Downloading photo from: ${photoUrl}`);
    const response = await fetch(photoUrl);

    if (!response.ok) {
      console.log(
        `[Report] Failed to download photo: ${response.status} ${response.statusText}`,
      );
      return false;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`[Report] Photo downloaded, size: ${buffer.length} bytes`);

    const inputFile = new InputFile(buffer);
    await ctx.replyWithPhoto(inputFile, {
      caption: `Photo from report ${reportId}`,
    });

    console.log(`[Report] Photo sent successfully`);
    return true;
  } catch (error) {
    console.log(`[Report] Error downloading/sending photo:`, error);
    return false;
  }
}

export async function handleReportCommand(ctx: Context) {
  try {
    const text = ctx.message?.text || "";
    const parts = text.split(" ");

    if (parts.length < 2) {
      await ctx.reply(
        "❌ Usage: /report &lt;ID&gt;\n\nExample: /report abc123xyz",
      );
      return;
    }

    const reportId = parts[1].trim();

    if (!reportId) {
      await ctx.reply(
        "❌ Please provide a valid report ID.\n\nExample: /report abc123xyz",
      );
      return;
    }

    const chatId = ctx.chatId!;

    // Check authentication
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
          "You need to authenticate first. Use /start to link your account.",
        ),
      );
      return;
    }

    // Fetch report details
    const reportEndpoint =
      (process.env.TELEGRAM_API_REPORT_DETAIL || TELEGRAM_API.REPORT_DETAIL) +
      `/${reportId}?chatId=${chatId}`;

    const response = await callTelegramApi<ReportDetailResponse>(
      reportEndpoint,
      {
        method: "GET",
      },
    );

    if (response.success && response.data && response.data.length > 0) {
      const report = response.data[0];
      const details = formatReportDetail(report);
      await ctx.reply(details, { parse_mode: "HTML" });

      // Send photos if available
      if (report.photos && report.photos.length > 0) {
        console.log(`[Report] Found ${report.photos.length} photos to send`);
        let photosSent = 0;

        for (const photoUrl of report.photos) {
          const sent = await downloadAndSendPhoto(ctx, photoUrl, report.id);
          if (sent) photosSent++;
        }

        if (photosSent < report.photos.length) {
          await ctx.reply(
            `⚠️ Could only load ${photosSent}/${report.photos.length} photos.`,
          );
        }
      }
    } else {
      await ctx.reply(
        formatAuthErrorMessage(
          response.error || "Report not found or you don't have access to it.",
        ),
      );
    }
  } catch (error) {
    console.log("Error in /report command:", error);
    await ctx.reply(
      "An unexpected error occurred. Please try again later or contact support.",
    );
  }
}
