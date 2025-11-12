import { UploaderController } from "@/app/lib/controllers/uploader.controller";
import type {
  TusCreateData,
  TusUploadData,
  TusStatusData,
  TusDeleteData,
} from "@/app/lib/dtos/tus.header.dto";
import { PhotoUploaderService } from "@/app/lib/services/photoUpload.service";
import { PhotoUpdaterService } from "@/app/lib/services/photoUpdate.service";
import { PhotoStatusService } from "@/app/lib/services/photoStatus.service";
import { PhotoDeleteService } from "@/app/lib/services/photoDelete.service";

const mockUploaderService = {
  createUploadPhoto: jest.fn(),
};

const mockUpdaterService = {
  updatePhoto: jest.fn(),
};

const mockStatusService = {
  getPhotoStatus: jest.fn(),
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

jest.mock("@/app/lib/services/photoUpdate.service", () => {
  return {
    PhotoUpdaterService: {
      getInstance: jest.fn(),
    },
  };
});

jest.mock("@/app/lib/services/photoStatus.service", () => {
  return {
    PhotoStatusService: {
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
  let uploaderController: UploaderController;
  let mockCreateData: TusCreateData;

  beforeEach(() => {
    uploaderController = new UploaderController();
    mockCreateData = {
      "tus-resumable": "1.0.0",
      "upload-length": 1024,
      "content-length": 1024,
      "upload-metadata": "filename test.jpg",
    };

    jest.clearAllMocks();
  });

  it("should create upload photo successfully", async () => {
    const mockBodyBytes = new ArrayBuffer(10);
    (PhotoUploaderService.getInstance as jest.Mock).mockReturnValue(
      mockUploaderService
    );
    mockUploaderService.createUploadPhoto.mockResolvedValue({
      location: "/files/upload-123",
      uploadOffset: 0,
    });

    const response = await uploaderController.createUploadPhoto(
      mockCreateData,
      mockBodyBytes
    );

    expect(response.success).toBe(true);
    expect((response as any).location).toBe("/files/upload-123");
    expect((response as any).uploadOffset).toBe(0);
    expect(PhotoUploaderService.getInstance).toHaveBeenCalled();
    expect(mockUploaderService.createUploadPhoto).toHaveBeenCalled();
  });

  it("should handle empty ArrayBuffer", async () => {
    const mockBodyBytes = new ArrayBuffer(0);
    (PhotoUploaderService.getInstance as jest.Mock).mockReturnValue(
      mockUploaderService
    );
    mockUploaderService.createUploadPhoto.mockResolvedValue({
      location: "/files/upload-456",
      uploadOffset: 0,
    });

    const response = await uploaderController.createUploadPhoto(
      mockCreateData,
      mockBodyBytes
    );

    expect(response.success).toBe(true);
    expect(mockUploaderService.createUploadPhoto).toHaveBeenCalledWith(
      expect.objectContaining({
        body: mockBodyBytes,
      })
    );
  });

  it("should throw error on invalid data schema", async () => {
    const mockBodyBytes = new ArrayBuffer(10);
    const invalidData = {
      "tus-resumable": "1.0.0",
      "upload-length": "not-a-number",
    } as any;

    (PhotoUploaderService.getInstance as jest.Mock).mockReturnValue(
      mockUploaderService
    );

    await expect(
      uploaderController.createUploadPhoto(invalidData, mockBodyBytes)
    ).rejects.toThrow();
  });
});

describe("UploaderController - uploadPhotoChunk", () => {
  let uploaderController: UploaderController;
  let mockUploadData: TusUploadData;
  const uploadId = "upload-123";

  beforeEach(() => {
    uploaderController = new UploaderController();
    mockUploadData = {
      "tus-resumable": "1.0.0",
      "upload-offset": 0,
      "content-type": "application/offset+octet-stream",
      "content-length": 512,
    };

    jest.clearAllMocks();
  });

  it("should upload photo chunk successfully", async () => {
    const mockChunkBytes = new ArrayBuffer(512);
    (PhotoUpdaterService.getInstance as jest.Mock).mockReturnValue(
      mockUpdaterService
    );
    mockUpdaterService.updatePhoto.mockResolvedValue({
      uploadOffset: 512,
    });

    const response = await uploaderController.uploadPhotoChunk(
      uploadId,
      mockUploadData,
      mockChunkBytes
    );

    expect(response.success).toBe(true);
    expect((response as any).uploadOffset).toBe(512);
    expect(PhotoUpdaterService.getInstance).toHaveBeenCalled();
    expect(mockUpdaterService.updatePhoto).toHaveBeenCalled();
  });

  it("should throw error when chunk size does not match content-length", async () => {
    const mockChunkBytes = new ArrayBuffer(256); // Size doesn't match content-length
    (PhotoUpdaterService.getInstance as jest.Mock).mockReturnValue(
      mockUpdaterService
    );

    await expect(
      uploaderController.uploadPhotoChunk(
        uploadId,
        mockUploadData,
        mockChunkBytes
      )
    ).rejects.toThrow("Chunk size does not match content-length");
  });

  it("should handle multiple chunks", async () => {
    const mockChunkBytes = new ArrayBuffer(512);
    const updatedData = { ...mockUploadData, "upload-offset": 512 };

    (PhotoUpdaterService.getInstance as jest.Mock).mockReturnValue(
      mockUpdaterService
    );
    mockUpdaterService.updatePhoto.mockResolvedValue({
      uploadOffset: 1024,
    });

    const response = await uploaderController.uploadPhotoChunk(
      uploadId,
      updatedData,
      mockChunkBytes
    );

    expect((response as any).uploadOffset).toBe(1024);
    expect(mockUpdaterService.updatePhoto).toHaveBeenCalledWith(
      expect.objectContaining({
        uploadOffset: 512,
      })
    );
  });

  it("should throw error on invalid data schema", async () => {
    const mockChunkBytes = new ArrayBuffer(512);
    const invalidData = {
      "tus-resumable": "1.0.0",
      "upload-offset": "not-a-number",
      "content-type": "image/jpeg",
      "content-length": 512,
    } as any;

    (PhotoUpdaterService.getInstance as jest.Mock).mockReturnValue(
      mockUpdaterService
    );

    await expect(
      uploaderController.uploadPhotoChunk(uploadId, invalidData, mockChunkBytes)
    ).rejects.toThrow();
  });
});

describe("UploaderController - getUploadStatus", () => {
  let uploaderController: UploaderController;
  let mockStatusData: TusStatusData;
  const uploadId = "upload-123";

  beforeEach(() => {
    uploaderController = new UploaderController();
    mockStatusData = {
      "tus-resumable": "1.0.0",
    };

    jest.clearAllMocks();
  });

  it("should get upload status successfully", async () => {
    (PhotoStatusService.getInstance as jest.Mock).mockReturnValue(
      mockStatusService
    );
    mockStatusService.getPhotoStatus.mockResolvedValue({
      uploadOffset: 512,
    });

    const response = await uploaderController.getUploadStatus(
      uploadId,
      mockStatusData
    );

    expect(response.success).toBe(true);
    expect((response as any).uploadOffset).toBe(512);
    expect(PhotoStatusService.getInstance).toHaveBeenCalled();
    expect(mockStatusService.getPhotoStatus).toHaveBeenCalled();
  });

  it("should throw error when upload not found", async () => {
    (PhotoStatusService.getInstance as jest.Mock).mockReturnValue(
      mockStatusService
    );
    mockStatusService.getPhotoStatus.mockResolvedValue(null);

    await expect(
      uploaderController.getUploadStatus(uploadId, mockStatusData)
    ).rejects.toThrow("Upload not found");
  });

  it("should throw error on invalid data schema", async () => {
    const invalidData = {
      "tus-resumable": undefined,
    } as any;

    (PhotoStatusService.getInstance as jest.Mock).mockReturnValue(
      mockStatusService
    );

    await expect(
      uploaderController.getUploadStatus(uploadId, invalidData)
    ).rejects.toThrow();
  });
});

describe("UploaderController - deleteUpload", () => {
  let uploaderController: UploaderController;
  let mockDeleteData: TusDeleteData;
  const uploadId = "upload-123";

  beforeEach(() => {
    uploaderController = new UploaderController();
    mockDeleteData = {
      "tus-resumable": "1.0.0",
    };

    jest.clearAllMocks();
  });

  it("should delete upload successfully", async () => {
    (PhotoDeleteService.getInstance as jest.Mock).mockReturnValue(
      mockDeleteService
    );
    mockDeleteService.deletePhoto.mockResolvedValue({
      success: true,
    });

    const response = await uploaderController.deleteUpload(
      uploadId,
      mockDeleteData
    );

    expect(response.success).toBe(true);
    expect(PhotoDeleteService.getInstance).toHaveBeenCalled();
    expect(mockDeleteService.deletePhoto).toHaveBeenCalled();
  });

  it("should throw error when delete fails", async () => {
    (PhotoDeleteService.getInstance as jest.Mock).mockReturnValue(
      mockDeleteService
    );
    mockDeleteService.deletePhoto.mockResolvedValue({
      success: false,
      message: "Failed to delete photo",
    });

    await expect(
      uploaderController.deleteUpload(uploadId, mockDeleteData)
    ).rejects.toThrow("Failed to delete photo");
  });

  it("should throw error with default message when delete fails without message", async () => {
    (PhotoDeleteService.getInstance as jest.Mock).mockReturnValue(
      mockDeleteService
    );
    mockDeleteService.deletePhoto.mockResolvedValue({
      success: false,
    });

    await expect(
      uploaderController.deleteUpload(uploadId, mockDeleteData)
    ).rejects.toThrow("Delete operation failed");
  });

  it("should throw error on invalid data schema", async () => {
    const invalidData = {
      "tus-resumable": undefined,
    } as any;

    (PhotoDeleteService.getInstance as jest.Mock).mockReturnValue(
      mockDeleteService
    );

    await expect(
      uploaderController.deleteUpload(uploadId, invalidData)
    ).rejects.toThrow();
  });
});
