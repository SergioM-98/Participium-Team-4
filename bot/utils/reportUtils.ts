import { CitizenReport } from "../dtos/report.dto";

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

  let summary = `📊 <b>Your Reports Summary</b>\n`;
  summary += `Total: <b>${reports.length}</b>\n\n`;

  if (statuses["RESOLVED"]) summary += `✅ Resolved: ${statuses["RESOLVED"]}\n`;
  if (statuses["IN_PROGRESS"])
    summary += `🔄 In Progress: ${statuses["IN_PROGRESS"]}\n`;
  if (statuses["ASSIGNED"]) summary += `📌 Assigned: ${statuses["ASSIGNED"]}\n`;
  if (statuses["PENDING_APPROVAL"])
    summary += `⏳ Pending Approval: ${statuses["PENDING_APPROVAL"]}\n`;
  if (statuses["SUSPENDED"])
    summary += `⏸️ Suspended: ${statuses["SUSPENDED"]}\n`;
  if (statuses["REJECTED"]) summary += `❌ Rejected: ${statuses["REJECTED"]}\n`;

  return summary;
}
