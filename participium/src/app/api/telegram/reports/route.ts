import {
  registerTelegramReport,
  isUserAuthenticatedByTelegram,
} from "@/controllers/telegramBot.controller";
import { telegramAPIReportRequestSchema } from "@/dtos/telegramBot.dto";

export async function POST(req: Request) {
  try {
    console.log("[Reports API] Received request");
    const form = await req.formData();

    const data = {
      title: form.get("title"),
      description: form.get("description"),
      latitude: form.get("latitude"),
      longitude: form.get("longitude"),
      category: form.get("category"),
      chatId: form.get("chatId"),
    };

    console.log("[Reports API] Form data:", data);

    // Verify that the chatId belongs to a registered user
    const chatId = data.chatId ? Number(data.chatId) : null;
    if (!chatId) {
      console.log("[Reports API] Missing chatId");
      return Response.json(
        { success: false, error: "Chat ID is required" },
        { status: 400 }
      );
    }

    console.log("[Reports API] Checking authentication for chatId:", chatId);
    const authCheck = await isUserAuthenticatedByTelegram(chatId);
    console.log("[Reports API] Auth check result:", authCheck);
    if (!authCheck.success) {
      return Response.json(
        { success: false, error: "Unauthorized: User not authenticated" },
        { status: 401 }
      );
    }

    console.log("[Reports API] Validating data with schema");
    const parsed = telegramAPIReportRequestSchema.safeParse(data);
    if (!parsed.success) {
      console.log("[Reports API] Validation failed:", parsed.error);
      return Response.json(
        { success: false, error: parsed.error },
        { status: 400 }
      );
    }

    const photos = form.getAll("photos") as File[];
    console.log("[Reports API] Photos count:", photos.length);
    if (photos.length < 1 || photos.length > 3) {
      console.log("[Reports API] Invalid photo count");
      return Response.json(
        { success: false, error: "1 to 3 photos required" },
        { status: 400 }
      );
    }

    console.log("[Reports API] Calling registerTelegramReport");
    const response = await registerTelegramReport(parsed.data, photos);
    console.log("[Reports API] Registration result:", response);

    if (!response.success) {
      return Response.json(
        { success: false, error: response.error },
        { status: 500 }
      );
    }

    return Response.json(
      { success: true, data: response.data },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
