import { PhotoUploaderService } from "../../../src/app/lib/services/photoUpload.service";
import { PhotoDeleteService } from "../../../src/app/lib/services/photoDelete.service";
import { createUploadPhoto, deleteUpload } from "../../../src/app/lib/controllers/uploader.controller";

jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(),
}));

jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
    authOptions: {}
}));

const mockUploaderService = {
  createUploadPhoto: jest.fn(),
};

const mockDeleteService = {
  deletePhoto: jest.fn(),
};

jest.mock("@/app/lib/services/photoUpload.service", () => {
  return {
    PhotoUploaderService: {
      getInstance: jest.fn(),
    },
  };
});

jest.mock("@/app/lib/services/photoDelete.service", () => {
  return {
    PhotoDeleteService: {
      getInstance: jest.fn(),
    },
  };
});

describe("UploaderController - createUploadPhoto", () => {
  let mockFormData = new FormData();

  beforeEach(() => {
    mockFormData = new FormData();
    mockFormData.append("file", new Blob(["test content"], { type: "image/jpeg" }));
    mockFormData.append("tus-resumable", "1.0.0");
    mockFormData.append("upload-length", "1024");
    mockFormData.append("upload-metadata", "filename test.jpg");
    jest.clearAllMocks();
  });

  it("should create upload photo successfully", async () => {
    (PhotoUploaderService.getInstance as jest.Mock).mockReturnValue(
      mockUploaderService
    );
    mockUploaderService.createUploadPhoto.mockResolvedValue({
      location: "/files/upload-123",
      uploadOffset: 0,
    });

    const response = await createUploadPhoto(mockFormData);

    expect(response.success).toBe(true);
    if(response.success){
      expect(response.location).toBe("/files/upload-123");
      expect(response.uploadOffset).toBe(0);
    }
    expect(PhotoUploaderService.getInstance).toHaveBeenCalled();
    expect(mockUploaderService.createUploadPhoto).toHaveBeenCalledWith(
      expect.objectContaining({
        uploadLength: 1024,
        photoId: expect.any(String)
      })
    );
  });

  it("should return error on invalid data schema", async () => {
    const invalidFormData = new FormData();
    invalidFormData.append("file", new Blob(["test content"], { type: "image/jpeg" }));
    invalidFormData.append("tus-resumable", "1.0.0");
    invalidFormData.append("upload-length", "not-a-number");

    (PhotoUploaderService.getInstance as jest.Mock).mockReturnValue(
      mockUploaderService
    );

    const response = await createUploadPhoto(invalidFormData);
    
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
  });
});

describe("UploaderController - deleteUpload", () => {
  const uploadId = "upload-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete upload successfully", async () => {
    (PhotoDeleteService.getInstance as jest.Mock).mockReturnValue(
      mockDeleteService
    );
    mockDeleteService.deletePhoto.mockResolvedValue({
      success: true,
    });

    const response = await deleteUpload(uploadId);

    expect(response.success).toBe(true);
    expect(PhotoDeleteService.getInstance).toHaveBeenCalled();
    expect(mockDeleteService.deletePhoto).toHaveBeenCalledWith(
      expect.objectContaining({ photoId: uploadId })
    );
  });

  it("should return error when delete fails", async () => {
    (PhotoDeleteService.getInstance as jest.Mock).mockReturnValue(
      mockDeleteService
    );
    mockDeleteService.deletePhoto.mockResolvedValue({
      success: false,
      message: "Failed to delete photo",
    });

    const response = await deleteUpload(uploadId);

    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
  });

  it("should return error with default message when delete fails without message", async () => {
    (PhotoDeleteService.getInstance as jest.Mock).mockReturnValue(
      mockDeleteService
    );
    mockDeleteService.deletePhoto.mockResolvedValue({
      success: false,
    });

    const response = await deleteUpload(uploadId);

    expect(response.success).toBe(false);
    expect(response.error).toBe("Failed to delete upload photo");
  });
});
