import { NextRequest, NextResponse } from "next/server";
import { isUserAuthenticatedByTelegram } from "../../../lib/controllers/telegramBot.controller";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId } = body;

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: "Chat ID is required" },
        { status: 400 }
      );
    }

    const result = await isUserAuthenticatedByTelegram(chatId);

    // Always return 200 since the request was processed successfully
    // The success/failure is indicated in the response body
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error checking telegram authentication:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
