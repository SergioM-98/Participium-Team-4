import { registerTelegram } from "@/app/lib/controllers/telegramBot.controller";
import { telegramRegistrationSchema } from "@/app/lib/dtos/telegramBot.dto";

export async function POST(req: Request) {
  try {
    const secret = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
    if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = telegramRegistrationSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ success: false, error: "Invalid body" }, { status: 400 });
    }

    const result = await registerTelegram(
      parsed.data.token,
      parsed.data.telegramId
    );

    if (!result.success) {
      return Response.json(result, { status: 400 });
    }

    return Response.json(result);

  } catch (error) {
    console.error("Unexpected error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
