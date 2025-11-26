import { PhotoUploaderService } from "@/services/photoUpload.service";
import { PhotoRepository } from "@/repositories/photo.repository";
import { CreateUploadRequest } from "@/dtos/tus.dto";

describe("PhotoUploaderService - Story 12", () => {
  const mockRepo = {
    create: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(PhotoRepository, "getInstance").mockReturnValue(mockRepo);
  });

  it("should upload photo successfully", async () => {
    mockRepo.create.mockResolvedValue({ id: "photo-id-1" });
    const service = PhotoUploaderService.getInstance();
    const req: CreateUploadRequest = {
      uploadLength: 100,
      uploadMetadata: "filename dGVzdC5qcGc=",
      body: new ArrayBuffer(100),
      photoId: "123e4567-e89b-12d3-a456-426614174000",
    };
    const result = await service.createUploadPhoto(req);
    expect(result.location).toBe("photo-id-1");
    expect(mockRepo.create).toHaveBeenCalled();
  });

  it("should throw error for wrong body length", async () => {
    const service = PhotoUploaderService.getInstance();
    const req: CreateUploadRequest = {
      uploadLength: 100,
      uploadMetadata: "filename dGVzdC5qcGc=",
      body: new ArrayBuffer(50),
      photoId: "123e4567-e89b-12d3-a456-426614174001",
    };
    await expect(service.createUploadPhoto(req)).rejects.toThrow();
  });
});
