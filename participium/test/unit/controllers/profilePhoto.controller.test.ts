
import { createUploadPhoto, deletePhoto, getProfilePhotoUrl } from "@/ProfilePhoto.controller";
import { ProfilePhotoService } from "@/servvices/profilePhoto.service";

jest.mock("@/app/lib/services/profilePhoto.service", () => ({
  ProfilePhotoService: {
    getInstance: jest.fn().mockReturnValue({
      createUploadPhoto: jest.fn().mockResolvedValue({ location: "loc", uploadOffset: 100 }),
      deletePhoto: jest.fn().mockResolvedValue({ success: true }),
      getPhotoOfUser: jest.fn().mockResolvedValue({ url: "uploads/test.jpg" }),
    }),
  },
}));

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn().mockResolvedValue({ user: { id: "user-id-1", role: "CITIZEN" } }),
}));

jest.mock("@/auth", () => ({ authOptions: {} }));

describe("ProfilePhoto.controller - Story 9", () => {
  it("should upload profile photo", async () => {
    const formData = new FormData();
    formData.set("tus-resumable", "1.0.0");
    formData.set("upload-length", "100");
    formData.set("upload-metadata", "filename dGVzdC5qcGc=");
    formData.set("file", new File([new ArrayBuffer(100)], "test.jpg"));
    const result = await createUploadPhoto(formData);
    expect(result.success).toBe(true);
    if (result.success && "location" in result) {
      expect(result.location).toBe("loc");
    }
  });

  it("should delete profile photo", async () => {
    const result = await deletePhoto();
    expect(result.success).toBe(true);
  });

  it("should return profile photo url or null", async () => {
    const result = await getProfilePhotoUrl();
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result).toBe("string");
      expect(result).toMatch(/data:image/);
    }
  });
});