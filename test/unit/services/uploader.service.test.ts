import { createUploadPhoto } from "@/app/lib/controllers/uploader.controller";
import { PhotoRepository } from "@/app/lib/repositories/photo.repository";
import { savePhotoFile } from "@/utils/fileUtils";

const mockPhotoRepository = {
  create: jest.fn(),
  uploadPhotoChunk: jest.fn(),
  getUploadStatus: jest.fn(),
  deleteUpload: jest.fn(),
};

jest.mock('@/app/lib/repositories/photo.repository', () => {
  return {
    PhotoRepository: {
      getInstance: jest.fn(),
    },
  };
});

jest.mock('@/utils/fileUtils', () => ({
  savePhotoFile: jest.fn(),
}));



(PhotoRepository.getInstance as jest.Mock).mockReturnValue(mockPhotoRepository);



describe("Uploader Actions - createUploadPhoto", () => {
  let validFormData: FormData;
  beforeEach(() => {
    (PhotoRepository.getInstance as jest.Mock).mockReturnValue(mockPhotoRepository);
    validFormData = new FormData();
    validFormData.append("tus-resumable", "1.0.0");
    validFormData.append("upload-length", "12");
    validFormData.append("upload-metadata", "filename test.jpg");

    // Create a mock file
    const mockFile = new File(["test content"], "test.jpg", {
      type: "image/jpeg",
    });
    validFormData.append("file", mockFile);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create upload photo successfully", async () => {
    
    mockPhotoRepository.create.mockResolvedValue({
          id: "1",
          url: "/files/test.jpg",
          reportId: "undefined",
          size: "12",
          offset: 0,
          filename: "test.jpg"
      },
    );

    (savePhotoFile as jest.Mock).mockResolvedValue(12);


    const response = await createUploadPhoto(validFormData);

    expect(response.success).toBe(true);
    expect((response as any).location).toBe("1");
    expect((response as any).uploadOffset).toBe(12);
    expect(mockPhotoRepository.create).toHaveBeenCalled();
  });
  /*
  it("should handle upload without metadata", async () => {
    validFormData.delete("upload-metadata");

    mockUploaderController.createUploadPhoto.mockResolvedValue({
      success: true,
      location: "/files/upload-456",
      uploadOffset: 0,
      tusHeaders: {
        "Tus-Resumable": "1.0.0",
        Location: "/files/upload-456",
        "Upload-Offset": "0",
      },
    });

    const response = await new UploaderController().createUploadPhoto(validFormData);

    expect(response.success).toBe(true);
    expect(mockUploaderController.createUploadPhoto).toHaveBeenCalled();
  });
});

describe("Uploader Actions - uploadPhotoChunk", () => {
  let validFormData: FormData;
  const uploadId = "upload-123";

  beforeEach(() => {
    validFormData = new FormData();
    validFormData.append("tus-resumable", "1.0.0");
    validFormData.append("upload-offset", "0");
    validFormData.append("content-type", "image/jpeg");

    const mockChunk = new File(["chunk data"], "chunk.bin", {
      type: "application/octet-stream",
    });
    validFormData.append("chunk", mockChunk);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should upload photo chunk successfully", async () => {
    mockUploaderController.uploadPhotoChunk.mockResolvedValue({
      success: true,
      uploadOffset: 10,
      tusHeaders: {
        "Tus-Resumable": "1.0.0",
        "Upload-Offset": "10",
      },
    });

    const response = await new UploaderController().uploadPhotoChunk(uploadId, validFormData);

    expect(response.success).toBe(true);
    if (response.success) {
      expect((response as any).uploadOffset).toBe(10);
    }
    expect(mockUploaderController.uploadPhotoChunk).toHaveBeenCalled();
  });

  it("should return error when chunk is missing", async () => {
    validFormData.delete("chunk");

    const response = await new UploaderController().uploadPhotoChunk(uploadId, validFormData);

    expect(response.success).toBe(false);
    if (!response.success) {
      expect((response as any).error).toBe("No chunk data provided");
    }
    expect(mockUploaderController.uploadPhotoChunk).not.toHaveBeenCalled();
  });

  it("should handle different upload offsets", async () => {
    validFormData.set("upload-offset", "512");

    mockUploaderController.uploadPhotoChunk.mockResolvedValue({
      success: true,
      uploadOffset: 522,
      tusHeaders: {
        "Tus-Resumable": "1.0.0",
        "Upload-Offset": "522",
      },
    });

    const response = await new UploaderController().uploadPhotoChunk(uploadId, validFormData);

    if (response.success) {
      expect((response as any).uploadOffset).toBe(522);
    }
    expect(mockUploaderController.uploadPhotoChunk).toHaveBeenCalledWith(
      uploadId,
      expect.objectContaining({
        "upload-offset": 512,
      }),
      expect.any(ArrayBuffer)
    );
  });
});

describe("Uploader Actions - getUploadStatus", () => {
  const uploadId = "upload-123";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should get upload status successfully", async () => {
    mockUploaderController.getUploadStatus.mockResolvedValue({
      success: true,
      uploadOffset: 512,
      tusHeaders: {
        "Tus-Resumable": "1.0.0",
        "Upload-Offset": "512",
      },
    });

    const response = await new UploaderController().getUploadStatus(uploadId);

    expect(response.success).toBe(true);
    expect((response as any).uploadOffset).toBe(512);
    expect(mockUploaderController.getUploadStatus).toHaveBeenCalledWith(
      uploadId,
      expect.objectContaining({
        "tus-resumable": "1.0.0",
      })
    );
  });
});

describe("Uploader Actions - deleteUpload", () => {
  const uploadId = "upload-123";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should delete upload successfully", async () => {
    mockUploaderController.deleteUpload.mockResolvedValue({
      success: true,
      tusHeaders: {
        "Tus-Resumable": "1.0.0",
      },
    });

    const response = await new UploaderController().deleteUpload(uploadId);

    expect(response.success).toBe(true);
    expect(mockUploaderController.deleteUpload).toHaveBeenCalledWith(
      uploadId,
      expect.objectContaining({
        "tus-resumable": "1.0.0",
      })
    );
  });
  */
});
