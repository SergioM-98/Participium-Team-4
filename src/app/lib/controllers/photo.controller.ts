"use server";

import { PhotoRetrievalService } from "@/services/photoRetrieval.service";

export async function getPhoto(fileName: string) {
  const photoRetrievalService = PhotoRetrievalService.getInstance();
  const result = await photoRetrievalService.getPhoto(fileName);
  console.log("[Photo Controller] getPhoto called with fileName:", fileName);
  console.log("[Photo Controller] Response:", {
    success: result.success,
    dataLength: result.data ? result.data.substring(0, 50) + "..." : "null",
  });
  return result;
}
