"use server";
import { ControllerSuccessResponse, CreateUploadRequest } from "../dtos/tus.dto";
import { TusCreateDataSchema } from "../dtos/tus.header.dto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth";
import { ProfilePhotoService } from "../services/profilePhoto.service";
import fs from "node:fs/promises";
import path from "node:path";

export async function createUploadPhoto(
  formData: FormData
): Promise<ControllerSuccessResponse> {
  let tusResumable: string;
  let uploadLength: string;
  let uploadMetadata: string | null;
  let file: File | null;
  try {
    tusResumable = formData.get("tus-resumable") as string;
    uploadLength = formData.get("upload-length") as string;
    uploadMetadata = formData.get("upload-metadata") as string | null;
    file = formData.get("file") as File | null;
  } catch (error) {
    console.error("Error processing upload photo form data:", error);
    throw error;
  }
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.error("Unauthorized access: No valid session found.");
    return { success: false, error: "Unauthorized access", tusHeaders: {} };
  }

  const data = {
    "tus-resumable": tusResumable,
    "upload-length": Number.parseInt(uploadLength),
    "upload-metadata": uploadMetadata || undefined,
    "content-length": file ? file.size : 0,
  };

  // Convert file to ArrayBuffer if present
  let bodyBytes: ArrayBuffer;
  try{
    bodyBytes = file ? await file.arrayBuffer() : new ArrayBuffer(0);
  } catch (error) {
    console.error("Error converting file to ArrayBuffer:", error);
    return { success: false, error: "Failed to convert file to ArrayBuffer", tusHeaders: {} };
  }
  let validatedData;
  try{
    validatedData = TusCreateDataSchema.parse(data);
  } catch (error) {
    console.error("Error validating Tus create data:", error);
    return { success: false, error: "Invalid upload data", tusHeaders: {} };
  }

  // Generate photo ID and create service request DTO
  const photoId = crypto.randomUUID();
  const serviceRequest: CreateUploadRequest = {
    uploadLength: validatedData["upload-length"],
    uploadMetadata: validatedData["upload-metadata"],
    body: bodyBytes,
    photoId: photoId,
  };

  let userId = session.user.id;

  try{
    const result = await ProfilePhotoService.getInstance().createUploadPhoto(
      serviceRequest,
      userId
    );

    return {
      success: true,
      location: result.location,
      uploadOffset: result.uploadOffset,
      tusHeaders: {
        "Tus-Resumable": "1.0.0",
        Location: result.location,
        "Upload-Offset": result.uploadOffset.toString(),
      },
    };
  } catch (error) {
    console.error("Error creating upload photo:", error);
    return { success: false, error: "Failed to create upload photo", tusHeaders: {} };
  }
}

export async function getTusOptions(): Promise<ControllerSuccessResponse> {
  return {
    success: true,
    tusHeaders: {
      "Tus-Resumable": "1.0.0",
      "Tus-Version": "1.0.0",
      "Tus-Extension": "creation,creation-with-upload,termination",
      "Tus-Max-Size": (20 * 1024 * 1024).toString(),
    },
  };
}

export async function deletePhoto() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user?.role !== "CITIZEN") {
    throw new Error("Unauthorized access");
  }

  let userId = session.user.id;

  const result = await ProfilePhotoService.getInstance().deletePhoto(userId);

  return result;
}

export async function getProfilePhotoUrl() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  let userId = session.user.id;

  const photo = await ProfilePhotoService.getInstance().getPhotoOfUser(userId);

  if (photo) {
    try {
      const img = await fs.readFile(photo.url);
      const ext = path.extname(photo.url).toLowerCase(); // '.png'
      let mime;
      switch (ext) {
        case ".jpg":
          mime = "image/jpeg";
          break;
        case ".jpeg":
          mime = "image/jpeg";
          break;
        case ".webp":
          mime = "image/webp";
          break;
        case ".png":
        default:
          mime = "image/png";
      }

      return `data:${mime};base64,${img.toString("base64")}`;
    } catch (error) {
      console.error("Failed to load profile photo:", error);
      return null;
    }
  }
  /*client implementation example:
  "use client";

  import { getProfilePhotoUrl } from "@/components/ProfilePhoto.controller";

  import { useEffect, useState } from "react";



  export default function ProfilePhoto() {

  const [url, setUrl] = useState<string | null>(null);



  useEffect(() => {

      getProfilePhotoUrl().then(setUrl).catch(console.error);

  }, []);



  if (!url) return <p>Loading...</p>;



  return <img src={url} alt="Profile Photo" className="w-32 h-32 rounded-full" />;

  }

*/
}
