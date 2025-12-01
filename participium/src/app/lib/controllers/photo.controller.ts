"use server";

import { PhotoRetrievalService } from "../services/photoRetrieval.service";

export async function getPhoto(fileName: string) {
  const photoRetrievalService = PhotoRetrievalService.getInstance();
  try {
    return await photoRetrievalService.getPhoto(fileName);
  } catch (error) {
    console.error("Error retrieving photo:", error);
    return { success: false, error: "Failed to retrieve photo" };
  }
}
