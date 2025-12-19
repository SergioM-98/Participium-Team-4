"use server";
import { getReportByIdForTelegramUser } from "@/app/lib/controllers/report.controller";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const chatId = url.searchParams.get("chatId");
    const reportId = id;

    if (!chatId) {
      return Response.json(
        { success: false, error: "chatId query parameter is required" },
        { status: 400 },
      );
    }

    if (!reportId) {
      return Response.json(
        { success: false, error: "Report ID is required" },
        { status: 400 },
      );
    }

    const report = await getReportByIdForTelegramUser(reportId, chatId);

    return Response.json(report, { status: 200 });
  } catch (error) {
    console.log("An error occurred in Report Detail API GET:", error);
    return Response.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
