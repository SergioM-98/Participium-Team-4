import { CitizenReport } from "../dtos/report.dto";
import { Context, InputFile } from "grammy";

export const REPORTS_PER_PAGE = 5;

export function getStatusEmoji(status: string | undefined): string {
  if (!status) return "❓";
  const statusUpper = status.toUpperCase();

  switch (statusUpper) {
    case "RESOLVED":
      return "✅";
    case "REJECTED":
      return "❌";
    case "IN_PROGRESS":
      return "🔄";
    case "ASSIGNED":
      return "📌";
    case "SUSPENDED":
      return "⏸️";
    case "PENDING_APPROVAL":
      return "⏳";
    default:
      return "❓";
  }
}

export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatReportItem(report: CitizenReport, index: number): string {
  const emoji = getStatusEmoji(report.status);
  const label = toTitleCase(report.status || "pending");
  return `${emoji} <b>${index}. ${report.title}</b>\n   ID: ${report.id}\n   Status: ${label} `;
}

export function formatReportsSummary(reports: CitizenReport[]): string {
  const statuses = reports.reduce(
    (acc, report) => {
      const status = (report.status || "PENDING_APPROVAL").toUpperCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const statusDisplay = [
    { key: "RESOLVED", emoji: "✅", label: "Resolved" },
    { key: "IN_PROGRESS", emoji: "🔄", label: "In Progress" },
    { key: "ASSIGNED", emoji: "📌", label: "Assigned" },
    { key: "PENDING_APPROVAL", emoji: "⏳", label: "Pending Approval" },
    { key: "SUSPENDED", emoji: "⏸️", label: "Suspended" },
    { key: "REJECTED", emoji: "❌", label: "Rejected" },
  ];

  let summary = `📊 <b>Your Reports Summary</b>\n`;
  summary += `Total: <b>${reports.length}</b>\n\n`;

  statusDisplay.forEach(({ key, emoji, label }) => {
    if (statuses[key]) {
      summary += `${emoji} ${label}: ${statuses[key]}\n`;
    }
  });

  return summary;
}

export function escapeHtml(text: string | undefined): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function formatReportDetail(report: CitizenReport): string {
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

export async function downloadAndSendPhoto(
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

export async function sendReportPhotos(
  ctx: Context,
  reportId: string,
  photos: string[],
): Promise<void> {
  if (!photos || photos.length === 0) return;

  console.log(`[Report] Found ${photos.length} photos to send`);
  let photosSent = 0;

  for (const photoUrl of photos) {
    const sent = await downloadAndSendPhoto(ctx, photoUrl, reportId);
    if (sent) photosSent++;
  }

  if (photosSent < photos.length) {
    await ctx.reply(
      `⚠️ Could only load ${photosSent}/${photos.length} photos.`,
    );
  }
}

export function buildErrorMessage(errorMsg: string, reportId: string): string {
  let userMessage = `❌ Failed to retrieve report.\n\n`;

  if (errorMsg.toLowerCase().includes("not found")) {
    userMessage += `The report ID "<code>${reportId}</code>" doesn't exist.`;
  } else if (
    errorMsg.toLowerCase().includes("unauthorized") ||
    errorMsg.toLowerCase().includes("access")
  ) {
    userMessage += `You don't have access to this report.`;
  }

  return userMessage;
}
