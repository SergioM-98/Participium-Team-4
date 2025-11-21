"use server";

import { PhotoRetrievalService } from "@/services/photoRetrieval.service";

export async function getPhoto(fileName: string) {
  const photoRetrievalService = PhotoRetrievalService.getInstance();
  return photoRetrievalService.getPhoto(fileName);
}
