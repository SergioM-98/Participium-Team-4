"use server";
import { ControllerSuccessResponse, CreateUploadRequest } from "../dtos/tus.dto";
import { TusCreateDataSchema } from "../dtos/tus.header.dto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { ProfilePhotoService } from "../services/profilePhoto.service";
import fs from "fs/promises";
import path, { parse } from "path";



    export async function createUploadPhoto(formData: FormData) : Promise<ControllerSuccessResponse> {
      const tusResumable = formData.get('tus-resumable') as string;
      const uploadLength = formData.get('upload-length') as string;
      const uploadMetadata = formData.get('upload-metadata') as string | null;
      const file = formData.get('file') as File | null;
  
      const data = {
          'tus-resumable': tusResumable,
          'upload-length': parseInt(uploadLength) as number,
          'upload-metadata': uploadMetadata || undefined,
          'content-length': file ? file.size : 0,
      };
  
      // Convert file to ArrayBuffer if present
      const bodyBytes = file ? await file.arrayBuffer() : new ArrayBuffer(0);
  
        const validatedData = TusCreateDataSchema.parse(data);

        // Generate photo ID and create service request DTO
        const photoId = crypto.randomUUID();
        const serviceRequest: CreateUploadRequest = {
            uploadLength: validatedData['upload-length'],
            uploadMetadata: validatedData['upload-metadata'],
            body: bodyBytes,
            photoId: photoId
        };

        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id || session.user?.role !== "CITIZEN") {
            throw new Error("Unauthorized access");
        }

        let userId = session.user.id;
        

        const result = await ProfilePhotoService.getInstance().createUploadPhoto(serviceRequest, userId);

        return {
            success: true,
            location: result.location,
            uploadOffset: result.uploadOffset,
            tusHeaders: {
                'Tus-Resumable': '1.0.0',
                'Location': result.location,
                'Upload-Offset': result.uploadOffset.toString(),
            }
        };
    }


    export async function getTusOptions(): Promise<ControllerSuccessResponse> {
        return {
            success: true,
            tusHeaders: {
                'Tus-Resumable': '1.0.0',
                'Tus-Version': '1.0.0',
                'Tus-Extension': 'creation,creation-with-upload,termination',
                'Tus-Max-Size': (20 * 1024 * 1024).toString(),
            }
        };
    }

    export async function deletePhoto() {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id || session.user?.role !== "CITIZEN") {
            throw new Error("Unauthorized access");
        }

        let userId = session.user.id;

        const result = await ProfilePhotoService.getInstance().deletePhoto(userId);

        return result;

    }

    export async function getProfilePhotoUrl() {

        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id || session.user?.role !== "CITIZEN") {
            throw new Error("Unauthorized access");
        }

        const photo = await ProfilePhotoService.getInstance().getPhotoOfUser(session.user.id);

        if (!photo) {
            throw new Error("Profile photo not found");
        }else{
            const img = await fs.readFile(photo.url);
            const ext = path.extname(photo.url).toLowerCase(); // '.png'
            const mime = ext === ".jpg" || ext === ".jpeg"
            ? "image/jpeg"
            : ext === ".webp"
            ? "image/webp"
            : "image/png";

            return `data:${mime};base64,${img.toString("base64")}`;
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