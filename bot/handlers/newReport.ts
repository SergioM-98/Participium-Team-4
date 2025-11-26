import { Conversation } from "@grammyjs/conversations";
import { Context } from "grammy";
import { PhotoSize } from "grammy/types";
import { Category } from "../../app/lib/dtos/report.dto";
import { createCategoryKeyboard } from "../keyboards/categoryKeyboard";
import { locationKeyboard } from "../keyboards/locationKeyboard";
import {
  ANONYMOUS_OPTIONS,
  createAnonymousKeyboard,
} from "../keyboards/anonymousKeyboard";
import { callTelegramApi, TELEGRAM_API } from "../utils/telegram.utils";
import { AuthenticationCheckResponse } from "../../app/lib/dtos/telegram.dto";
import {
  cancelKeyboard,
  CANCEL_CALLBACK_DATA,
} from "../keyboards/cancelKeyboard";

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
  CANCELLED: "Report creation cancelled.",
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
      return null;
    }
    const file = await ctx.api.getFile(fileId);

    if (!file.file_path) {
      return null;
    }

    const fileUrl = `https://api.telegram.org/file/bot${ctx.api.token}/${file.file_path}`;

    const response = await fetch(fileUrl);

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    return blob;
  } catch (error) {
    return null;
  }
}

async function collectPhotos(
  conversation: Conversation<Context>,
  ctx: Context
): Promise<PhotoSize[][] | null> {
  const photos: PhotoSize[][] = [];
  const IMAGE_MIMETYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  while (photos.length < MAX_PHOTOS) {
    try {
      const nextCtx = await conversation.wait();

      // Check for cancellation
      if (nextCtx.callbackQuery?.data === CANCEL_CALLBACK_DATA) {
        await nextCtx.answerCallbackQuery();
        await ctx.reply(MESSAGES.CANCELLED);
        return null;
      }

      const message = nextCtx.message;

      if (message?.text === "/done") {
        if (photos.length === 0) {
          await ctx.reply(
            "You must upload at least one photo. Send /done when finished."
          );
          continue;
        }
        break;
      }

      if (message?.photo && message.photo.length > 0) {
        photos.push(message.photo);
        await ctx.reply(MESSAGES.PHOTO_RECEIVED(photos.length, MAX_PHOTOS));

        if (photos.length === MAX_PHOTOS) {
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
        const photoArray = [
          {
            file_id: message.document.file_id,
            file_unique_id: message.document.file_unique_id,
            width: 0,
            height: 0,
          },
        ];
        photos.push(photoArray as PhotoSize[]);

        await ctx.reply(MESSAGES.PHOTO_RECEIVED(photos.length, MAX_PHOTOS));

        if (photos.length === MAX_PHOTOS) {
          await ctx.reply("Maximum photos reached. Processing report...");
          break;
        }

        if (photos.length < MAX_PHOTOS) {
          await ctx.reply(MESSAGES.SEND_MORE_PHOTOS);
        }
      } else if (message?.text) {
        await ctx.reply(
          "Please send a photo or type /done to finish uploading photos."
        );
      } else {
        await ctx.reply(
          "Please send a photo or image file. Type /done when finished."
        );
      }
    } catch (error) {
      await ctx.reply(
        "An error occurred while collecting photos. Please try again."
      );
      break;
    }
  }
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

    await ctx.reply(MESSAGES.ANONYMOUS, {
      reply_markup: createAnonymousKeyboard()
        .row()
        .text("❌ Cancel", CANCEL_CALLBACK_DATA),
    });
    const anonymousCtx = await conversation.wait();

    if (anonymousCtx.callbackQuery?.data === CANCEL_CALLBACK_DATA) {
      await anonymousCtx.answerCallbackQuery();
      await ctx.reply(MESSAGES.CANCELLED);
      return;
    }

    const isAnonymous =
      anonymousCtx.callbackQuery?.data === ANONYMOUS_OPTIONS[0].callback_data;

    await ctx.reply(MESSAGES.TITLE, { reply_markup: cancelKeyboard });

    let title = "";
    while (true) {
      const titleCtx = await conversation.wait();

      if (titleCtx.callbackQuery?.data === CANCEL_CALLBACK_DATA) {
        await titleCtx.answerCallbackQuery();
        await ctx.reply(MESSAGES.CANCELLED);
        return;
      }

      if (!titleCtx.message?.text) {
        if (titleCtx.message?.photo) {
          await ctx.reply("Please send only text for the title, not photos.", {
            reply_markup: cancelKeyboard,
          });
        } else {
          await ctx.reply("Please send a valid title.", {
            reply_markup: cancelKeyboard,
          });
        }
        continue;
      }

      const validation = validateTitle(titleCtx.message.text);
      if (validation.valid) {
        title = titleCtx.message.text;
        break;
      }
      await ctx.reply(validation.error!, { reply_markup: cancelKeyboard });
    }

    await ctx.reply(MESSAGES.DESCRIPTION, { reply_markup: cancelKeyboard });

    let description = "";
    while (true) {
      const descCtx = await conversation.wait();

      if (descCtx.callbackQuery?.data === CANCEL_CALLBACK_DATA) {
        await descCtx.answerCallbackQuery();
        await ctx.reply(MESSAGES.CANCELLED);
        return;
      }

      if (!descCtx.message?.text) {
        if (descCtx.message?.photo) {
          await ctx.reply(
            "Please send only text for the description, not photos.",
            { reply_markup: cancelKeyboard }
          );
        } else {
          await ctx.reply("Please send a valid description.", {
            reply_markup: cancelKeyboard,
          });
        }
        continue;
      }

      const validation = validateDescription(descCtx.message.text);
      if (validation.valid) {
        description = descCtx.message.text;
        break;
      }
      await ctx.reply(validation.error!, { reply_markup: cancelKeyboard });
    }

    await ctx.reply(MESSAGES.CATEGORY, {
      reply_markup: createCategoryKeyboard()
        .row()
        .text("❌ Cancel", CANCEL_CALLBACK_DATA),
    });
    const categoryCtx = await conversation.wait();

    if (categoryCtx.callbackQuery?.data === CANCEL_CALLBACK_DATA) {
      await categoryCtx.answerCallbackQuery();
      await ctx.reply(MESSAGES.CANCELLED);
      return;
    }

    const categoryData = categoryCtx.callbackQuery?.data;

    if (!isValidCategory(categoryData)) {
      await ctx.reply("Invalid category selected. Please try again.");
      return;
    }

    await ctx.reply(MESSAGES.LOCATION, {
      reply_markup: locationKeyboard,
    });
    await ctx.reply("Or tap the cancel button:", {
      reply_markup: cancelKeyboard,
    });

    let location = null;
    while (!location) {
      const locationCtx = await conversation.wait();

      if (locationCtx.callbackQuery?.data === CANCEL_CALLBACK_DATA) {
        await locationCtx.answerCallbackQuery();
        await ctx.reply(MESSAGES.CANCELLED);
        return;
      }

      if (!locationCtx.message?.location) {
        await ctx.reply(MESSAGES.LOCATION_ERROR, {
          reply_markup: cancelKeyboard,
        });
        continue;
      }

      location = locationCtx.message.location;
    }

    while (!isLocationWithinTurin(location.latitude, location.longitude)) {
      await ctx.reply(MESSAGES.LOCATION_OUT_OF_BOUNDS, {
        reply_markup: cancelKeyboard,
      });

      const newLocationCtx = await conversation.wait();

      if (newLocationCtx.callbackQuery?.data === CANCEL_CALLBACK_DATA) {
        await newLocationCtx.answerCallbackQuery();
        await ctx.reply(MESSAGES.CANCELLED);
        return;
      }

      if (!newLocationCtx.message?.location) {
        await ctx.reply(MESSAGES.LOCATION_ERROR, {
          reply_markup: cancelKeyboard,
        });
        continue;
      }

      location = newLocationCtx.message.location;
    }

    await ctx.reply(MESSAGES.PHOTOS, {
      reply_markup: { remove_keyboard: true },
    });
    await ctx.reply("Or tap the cancel button:", {
      reply_markup: cancelKeyboard,
    });

    const photos = await collectPhotos(conversation, ctx);

    if (!photos) {
      // User cancelled during photo collection
      return;
    }

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

      let photosAdded = 0;
      for (let i = 0; i < photos.length; i++) {
        const fileId = photos[i][photos[i].length - 1]?.file_id;

        const blob = await downloadAndProcessPhoto(ctx, fileId, i + 1);

        if (blob) {
          formData.append("photos", blob, `photo_${photosAdded + 1}.jpg`);
          photosAdded++;
        }
      }

      const backendUrl = process.env.BACKEND_URL;
      if (!backendUrl) {
        await ctx.reply(
          "Server configuration error. Please contact the administrator."
        );
        return;
      }

      const apiUrl = `${backendUrl}${TELEGRAM_API.SEND_REPORT}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        await ctx.reply(MESSAGES.ERROR);
        return;
      }

      const responseData = await response.json();
      await ctx.reply(MESSAGES.SUCCESS);
    } catch (error) {
      await ctx.reply(MESSAGES.CONNECTION_ERROR);
    }
  } catch (error) {
    await ctx.reply(MESSAGES.CONNECTION_ERROR);
  }
}
