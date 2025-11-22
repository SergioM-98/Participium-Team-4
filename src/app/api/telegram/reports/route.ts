import { registerTelegramReport } from "@/app/lib/controllers/telegramBot.controller";
import { telegramAPIReportRequestSchema } from "@/app/lib/dtos/telegramBot.dto";

export async function POST(req: Request) {
  

  try{
    const secret = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
    if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    const form = await req.formData();

    const data = {
      title: form.get("title"),
      description: form.get("description"),
      latitude: form.get("latitude"),
      longitude: form.get("longitude"),
      category: form.get("category"),
      chatId: form.get("chatId"),
    };

    const parsed = telegramAPIReportRequestSchema.safeParse(data);
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error }, { status: 400 });
    }

    const photos = form.getAll("photos") as File[];
    if (photos.length < 1 || photos.length > 3) {
      return Response.json({ success: false, error: "1 to 3 photos required" }, { status: 400 });
    }

    const response = await registerTelegramReport(parsed.data, photos);

    if (!response.success) {
      return Response.json({ success: false, error: response.error }, { status: 500 });
    }

    return Response.json({ success: true, data: response.data }, { status: 200 });

    
  }catch(error){
    return Response.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}