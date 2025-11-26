
const mockProfilePhotoRepository = {
  getPhotoOfUser: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};

jest.mock("@/app/lib/repositories/profilePhotos.repository", () => {
  return {
    ProfilePhotoRepository: {
      getInstance: jest.fn().mockReturnValue(mockProfilePhotoRepository),
    },
  };
});

jest.mock("fs/promises", () => ({
  unlink: jest.fn().mockResolvedValue(undefined),
  rename: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../../src/app/lib/utils/fileUtils", () => ({
  savePhotoFile: jest.fn().mockResolvedValue(100),
}));


jest.mock("../../../src/app/lib/repositories/profilePhotos.repository", () => ({
  ProfilePhotoRepository: {
    getInstance: () => mockProfilePhotoRepository,
  },
}));


import { ProfilePhotoService } from "../../../src/app/lib/services/profilePhoto.service";
import { CreateUploadRequest } from "../../../src/app/lib/dtos/tus.dto";

describe("ProfilePhotoService - Story 9", () => {
  let service: ProfilePhotoService;
  beforeEach(() => {
    service = ProfilePhotoService.getInstance();
    jest.clearAllMocks();
  });

  it("should upload profile photo successfully", async () => {
    const request: CreateUploadRequest = {
      uploadLength: 100,
      uploadMetadata: "filename dGVzdC5qcGc=",
      body: new ArrayBuffer(100),
      photoId: "123e4567-e89b-12d3-a456-426614174000",
    };
    mockProfilePhotoRepository.create.mockResolvedValue({ id: "photo-id-1", url: "uploads/test.jpg" });
    const result = await service.createUploadPhoto(request, "user-id-1");
    expect(result.location).toBe("photo-id-1");
    expect(mockProfilePhotoRepository.create).toHaveBeenCalled();
  });

  it("should handle error when uploading photo with wrong length", async () => {
    const request: CreateUploadRequest = {
      uploadLength: 100,
      uploadMetadata: "filename dGVzdC5qcGc=",
      body: new ArrayBuffer(50),
      photoId: "123e4567-e89b-12d3-a456-426614174001",
    };
    await expect(service.createUploadPhoto(request, "user-id-2")).rejects.toThrow();
  });

  it("should delete profile photo", async () => {
    mockProfilePhotoRepository.getPhotoOfUser.mockResolvedValue({ id: "123e4567-e89b-12d3-a456-426614174002", url: "uploads/test.jpg" });
    mockProfilePhotoRepository.delete.mockResolvedValue({});
    const result = await service.deletePhoto("user-id-3");
    expect(result.success).toBe(true);
    expect(mockProfilePhotoRepository.delete).toHaveBeenCalled();
  });

  it("should handle error when deleting non-existent photo", async () => {
    mockProfilePhotoRepository.getPhotoOfUser.mockResolvedValue(null);
    const result = await service.deletePhoto("user-id-4");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/not found/);
  });
});
