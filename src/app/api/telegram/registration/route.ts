import { registerTelegram } from "@/app/lib/controllers/telegramBot.controller";
import { LinkTelegramAccountRequest } from "@/dtos/telegram.dto";

export async function POST(req: Request) {
  try {
    const body: LinkTelegramAccountRequest = await req.json();
    console.log("Registration endpoint called with body:", body);

    if (!body.authToken || !body.chatId) {
      console.log("Invalid body - missing authToken or chatId");
      return Response.json(
        { success: false, error: "Invalid body" },
        { status: 400 }
      );
    }

    console.log("Calling registerTelegram with:", body.authToken, body.chatId);
    const result = await registerTelegram(body.authToken, body.chatId);
    console.log("Registration result:", result);

    if (!result.success) {
      return Response.json(result, { status: 400 });
    }

    return Response.json(result);
  } catch (error) {
    console.error("Unexpected error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
