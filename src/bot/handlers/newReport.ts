import { Conversation } from "@grammyjs/conversations";
import { Context } from "grammy";
import { PhotoSize } from "grammy/types";
import { Category } from "../../app/lib/dtos/report.dto";
import { categoryKeyboard } from "../keyboards/categoryKeyboard";
import { locationKeyboard } from "../keyboards/locationKeyboard";
import {
  ANONYMOUS_OPTIONS,
  anonymousKeyboard,
} from "../keyboards/anonymousKeyboard";
import { callTelegramApi, TELEGRAM_API } from "../utils/telegram.utils";
import { AuthenticationCheckResponse } from "@/dtos/telegram.dto";

const MAX_PHOTOS = 3;
const MIN_TITLE_LENGTH = 5;
const MAX_TITLE_LENGTH = 100;
const MIN_DESCRIPTION_LENGTH = 10;
const MAX_DESCRIPTION_LENGTH = 500;
const TURIN_BOUNDS = {
  MIN_LAT: 45.028,
  MAX_LAT: 45.27,
  MIN_LON: 7.524,
  MAX_LON: 7.805,
};

const MESSAGES = {
  ANONYMOUS: "Do you want to submit the report anonymously?",
  TITLE: "Please provide the title of the report:",
  DESCRIPTION: "Please describe the problem in detail:",
  CATEGORY: "What is the category of the report?",
  LOCATION:
    "Please share your location. Use the button for your current position, or the attachment menu (📎) to pick a point on the map:",
  PHOTOS: "Please attach any photos (up to 3).",
  INVALID_TITLE: `Title must be between ${MIN_TITLE_LENGTH} and ${MAX_TITLE_LENGTH} characters.`,
  INVALID_DESCRIPTION: `Description must be between ${MIN_DESCRIPTION_LENGTH} and ${MAX_DESCRIPTION_LENGTH} characters.`,
  LOCATION_ERROR:
    "Please share your location using the button or the attachment menu.",
  LOCATION_OUT_OF_BOUNDS:
    "The location you provided is outside Turin. Please share a location within Turin.",
  PHOTO_RECEIVED: (current: number, max: number) =>
    `Photo ${current}/${max} received`,
  SEND_MORE_PHOTOS: "Send another photo or /done to finish",
  PHOTO_ERROR: "There was an error with the photo. Please, try again.",
  SENDING: "Sending your report...",
  SUCCESS: "Report sent successfully!",
  ERROR: "Error sending the report. Please try again later.",
  CONNECTION_ERROR: "Connection error. Please try again later.",
  PHOTO_COUNT: (count: number) => `Received ${count} photos in total!`,
  NOT_AUTHENTICATED:
    "You must link your Telegram account first. Use /start to authenticate.",
};

function validateTitle(title: string): { valid: boolean; error?: string } {
  const trimmed = title.trim();
  if (trimmed.length < MIN_TITLE_LENGTH || trimmed.length > MAX_TITLE_LENGTH) {
    return { valid: false, error: MESSAGES.INVALID_TITLE };
  }
  return { valid: true };
}

function validateDescription(description: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = description.trim();
  if (
    trimmed.length < MIN_DESCRIPTION_LENGTH ||
    trimmed.length > MAX_DESCRIPTION_LENGTH
  ) {
    return { valid: false, error: MESSAGES.INVALID_DESCRIPTION };
  }
  return { valid: true };
}

function isValidCategory(category: unknown): category is Category {
  return typeof category === "string" && category.length > 0;
}

function isLocationWithinTurin(latitude: number, longitude: number): boolean {
  return (
    latitude >= TURIN_BOUNDS.MIN_LAT &&
    latitude <= TURIN_BOUNDS.MAX_LAT &&
    longitude >= TURIN_BOUNDS.MIN_LON &&
    longitude <= TURIN_BOUNDS.MAX_LON
  );
}

async function downloadAndProcessPhoto(
  ctx: Context,
  fileId: string | undefined,
  photoIndex: number
): Promise<Blob | null> {
  try {
    if (!fileId) {
      console.error(
        `[Photo ${photoIndex}] Missing file_id - photo data may be corrupted`
      );
      return null;
    }

    console.log(
      `[Photo ${photoIndex}] Starting download with file_id: ${fileId}`
    );
    const file = await ctx.api.getFile(fileId);

    if (!file.file_path) {
      console.error(`[Photo ${photoIndex}] No file path returned from getFile`);
      return null;
    }

    const fileUrl = `https://api.telegram.org/file/bot${ctx.api.token}/${file.file_path}`;
    console.log(`[Photo ${photoIndex}] Downloading from URL: ${fileUrl}`);

    const response = await fetch(fileUrl);

    if (!response.ok) {
      console.error(
        `[Photo ${photoIndex}] Download failed with status ${response.status}: ${response.statusText}`
      );
      return null;
    }

    const blob = await response.blob();
    console.log(
      `[Photo ${photoIndex}] Downloaded successfully, size: ${blob.size} bytes`
    );
    return blob;
  } catch (error) {
    console.error(`[Photo ${photoIndex}] Error during download:`, error);
    return null;
  }
}

async function collectPhotos(
  conversation: Conversation<Context>,
  ctx: Context
): Promise<PhotoSize[][]> {
  const photos: PhotoSize[][] = [];
  const IMAGE_MIMETYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  console.log(`[Photos] Starting photo collection, max: ${MAX_PHOTOS}`);

  while (photos.length < MAX_PHOTOS) {
    try {
      const nextCtx = await conversation.waitFor("message");
      const message = nextCtx.message;

      console.log(`[Photos] Received message type:`, {
        hasPhoto: !!message?.photo,
        photoLength: message?.photo?.length ?? 0,
        hasDocument: !!message?.document,
        documentMimetype: message?.document?.mime_type,
        hasText: !!message?.text,
        textContent: message?.text,
      });

      if (message?.text === "/done") {
        console.log(`[Photos] User sent /done command`);
        if (photos.length === 0) {
          await ctx.reply(
            "You must upload at least one photo. Send /done when finished."
          );
          continue;
        }
        break;
      }

      if (message?.photo && message.photo.length > 0) {
        console.log(
          `[Photos] Photo detected with ${message.photo.length} quality versions`
        );
        photos.push(message.photo);
        console.log(
          `[Photos] Photo added, total: ${photos.length}/${MAX_PHOTOS}`
        );
        await ctx.reply(MESSAGES.PHOTO_RECEIVED(photos.length, MAX_PHOTOS));

        if (photos.length === MAX_PHOTOS) {
          console.log(`[Photos] Maximum photos reached`);
          await ctx.reply("Maximum photos reached. Processing report...");
          break;
        }

        if (photos.length < MAX_PHOTOS) {
          await ctx.reply(MESSAGES.SEND_MORE_PHOTOS);
        }
      } else if (
        message?.document &&
        message.document.mime_type &&
        IMAGE_MIMETYPES.includes(message.document.mime_type)
      ) {
        console.log(
          `[Photos] Image document detected: ${message.document.mime_type}`
        );
        // Convert document to PhotoSize-like array for consistency
        // Document has file_id which we can use in downloadAndProcessPhoto
        const photoArray = [
          {
            file_id: message.document.file_id,
            file_unique_id: message.document.file_unique_id,
            width: 0,
            height: 0,
          },
        ];
        photos.push(photoArray as PhotoSize[]);
        console.log(
          `[Photos] Image document added, total: ${photos.length}/${MAX_PHOTOS}`
        );
        await ctx.reply(MESSAGES.PHOTO_RECEIVED(photos.length, MAX_PHOTOS));

        if (photos.length === MAX_PHOTOS) {
          console.log(`[Photos] Maximum photos reached`);
          await ctx.reply("Maximum photos reached. Processing report...");
          break;
        }

        if (photos.length < MAX_PHOTOS) {
          await ctx.reply(MESSAGES.SEND_MORE_PHOTOS);
        }
      } else if (message?.text) {
        console.log(`[Photos] Received non-/done text: "${message.text}"`);
        await ctx.reply(
          "Please send a photo or type /done to finish uploading photos."
        );
      } else {
        console.log(
          `[Photos] Received unsupported message type (document: ${!!message?.document})`
        );
        await ctx.reply(
          "Please send a photo or image file. Type /done when finished."
        );
      }
    } catch (error) {
      console.error(`[Photos] Error collecting photos:`, error);
      await ctx.reply(
        "An error occurred while collecting photos. Please try again."
      );
      break;
    }
  }

  console.log(
    `[Photos] Photo collection complete, total photos: ${photos.length}`
  );
  return photos;
}

export async function newReport(
  conversation: Conversation<Context>,
  ctx: Context
) {
  const chatId = ctx.chatId!;

  try {
    const isAuthenticated = await callTelegramApi<AuthenticationCheckResponse>(
      TELEGRAM_API.IS_AUTHENTICATED,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      }
    );

    if (!isAuthenticated.success) {
      await ctx.reply(MESSAGES.NOT_AUTHENTICATED);
      return;
    }

    await ctx.reply(MESSAGES.ANONYMOUS, { reply_markup: anonymousKeyboard });
    const anonymousCtx = await conversation.waitFor("callback_query:data");
    const isAnonymous =
      anonymousCtx.callbackQuery?.data === ANONYMOUS_OPTIONS[0].callback_data;

    await ctx.reply(MESSAGES.TITLE);
    let title = await conversation.form.text();
    while (true) {
      const validation = validateTitle(title);
      if (validation.valid) {
        break;
      }
      await ctx.reply(validation.error!);
      title = await conversation.form.text();
    }

    await ctx.reply(MESSAGES.DESCRIPTION);
    let description = await conversation.form.text();
    while (true) {
      const validation = validateDescription(description);
      if (validation.valid) {
        break;
      }
      await ctx.reply(validation.error!);
      description = await conversation.form.text();
    }

    await ctx.reply(MESSAGES.CATEGORY, { reply_markup: categoryKeyboard });
    const categoryCtx = await conversation.waitFor("callback_query:data");
    const categoryData = categoryCtx.callbackQuery?.data;

    if (!isValidCategory(categoryData)) {
      await ctx.reply("Invalid category selected. Please try again.");
      return;
    }

    await ctx.reply(MESSAGES.LOCATION, {
      reply_markup: locationKeyboard,
    });
    const location = await conversation.form.location({
      otherwise: async (ctx) => {
        await ctx.reply(MESSAGES.LOCATION_ERROR);
      },
    });

    if (!location) {
      await ctx.reply(MESSAGES.LOCATION_ERROR);
      return;
    }

    while (!isLocationWithinTurin(location.latitude, location.longitude)) {
      await ctx.reply(MESSAGES.LOCATION_OUT_OF_BOUNDS);
      const newLocation = await conversation.form.location({
        otherwise: async (ctx) => {
          await ctx.reply(MESSAGES.LOCATION_ERROR);
        },
      });

      if (!newLocation) {
        await ctx.reply(MESSAGES.LOCATION_ERROR);
        return;
      }

      location.latitude = newLocation.latitude;
      location.longitude = newLocation.longitude;
    }

    await ctx.reply(MESSAGES.PHOTOS, {
      reply_markup: { remove_keyboard: true },
    });
    const photos = await collectPhotos(conversation, ctx);
    await ctx.reply(MESSAGES.PHOTO_COUNT(photos.length));

    await ctx.reply(MESSAGES.SENDING);

    try {
      const formData = new FormData();

      formData.append("chatId", String(chatId));
      formData.append("isAnonymous", String(isAnonymous));
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("latitude", String(location.latitude));
      formData.append("longitude", String(location.longitude));
      formData.append("category", categoryData);

      console.log(`[Report] Current report data: ${formData}`);

      let photosAdded = 0;
      for (let i = 0; i < photos.length; i++) {
        const fileId = photos[i][photos[i].length - 1]?.file_id;

        console.log(`[Report] Processing photo ${i + 1}/${photos.length}`);
        const blob = await downloadAndProcessPhoto(ctx, fileId, i + 1);

        if (blob) {
          formData.append("photos", blob, `photo_${photosAdded + 1}.jpg`);
          photosAdded++;
          console.log(
            `[Report] Photo ${i + 1} added to form data (${photosAdded} total)`
          );
        } else {
          console.warn(`[Report] Photo ${i + 1} could not be downloaded`);
        }
      }

      console.log(
        `[Report] Sending report with ${photosAdded}/${photos.length} photos`
      );

      const backendUrl = process.env.BACKEND_URL;
      if (!backendUrl) {
        console.error(`[Report] BACKEND_URL environment variable is not set`);
        await ctx.reply(
          "Server configuration error. Please contact the administrator."
        );
        return;
      }

      const apiUrl = `${backendUrl}${TELEGRAM_API.SEND_REPORT}`;
      console.log(`[Report] Sending to URL: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error(
          `[Report] Failed to send report: ${response.status} ${response.statusText}`
        );
        const errorText = await response.text();
        console.error(`[Report] Error response: ${errorText}`);
        await ctx.reply(MESSAGES.ERROR);
        return;
      }

      const responseData = await response.json();
      console.log(`[Report] Report sent successfully, response:`, responseData);
      await ctx.reply(MESSAGES.SUCCESS);
    } catch (error) {
      console.error(`[Report] Error sending report:`, error);
      await ctx.reply(MESSAGES.CONNECTION_ERROR);
    }
  } catch (error) {
    await ctx.reply(MESSAGES.CONNECTION_ERROR);
  }
}
