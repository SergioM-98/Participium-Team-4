import type {
  TusCreateData,
  TusUploadData,
  TusStatusData,
  TusDeleteData,
} from "../../../src/app/lib/dtos/tus.header.dto";
import { PhotoUploaderService } from "../../../src/app/lib/services/photoUpload.service";
import { PhotoUpdaterService } from "../../../src/app/lib/services/photoUpdate.service";
import { PhotoStatusService } from "../../../src/app/lib/services/photoStatus.service";
import { PhotoDeleteService } from "../../../src/app/lib/services/photoDelete.service";
import { createUploadPhoto, deleteUpload, getUploadStatus, uploadPhotoChunk } from "../../../src/app/lib/controllers/uploader.controller";

jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(),
}));

jest.mock('@/auth', () => ({
    authOptions: {}
}));

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
  let mockCreateData: TusCreateData;
  let mockFormData = new FormData();

  beforeEach(() => {
    mockCreateData = {
      "tus-resumable": "1.0.0",
      "upload-length": 1024,
      "content-length": 1024,
      "upload-metadata": "filename test.jpg",
    };
    mockFormData.append("chunk", new Blob(["test content"], { type: "image/jpeg" }));
    mockFormData.append("tus-resumable", "1.0.0");
    mockFormData.append("upload-length", "1024");
    mockFormData.append("content-length", "1024");
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

    const response = await createUploadPhoto(
      mockFormData
    );

    expect(response.success).toBe(true);
    if(response.success){
    expect(response.location).toBe("/files/upload-123");
    expect(response.uploadOffset).toBe(0);
    }
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

    const response = await createUploadPhoto(
      mockFormData
    );

    expect(response.success).toBe(true);
    expect(mockUploaderService.createUploadPhoto).toHaveBeenCalledWith(
      expect.objectContaining({
        body: mockBodyBytes,
      })
    );
  });

  it("should throw error on invalid data schema", async () => {
    const invalidFormData = new FormData();
    invalidFormData.append("chunk", new Blob(["test content"], { type: "image/jpeg" }));
    invalidFormData.append("tus-resumable", "1.0.0");
    invalidFormData.append("upload-length", "not-a-number");

    (PhotoUploaderService.getInstance as jest.Mock).mockReturnValue(
      mockUploaderService
    );

    await expect(
      createUploadPhoto(invalidFormData)
    ).rejects.toThrow();
  });
});

describe("UploaderController - uploadPhotoChunk", () => {
  let mockUploadData: TusUploadData;
  let mockFormData: FormData;
  const uploadId = "upload-123";

  beforeEach(() => {
    mockUploadData = {
      "tus-resumable": "1.0.0",
      "upload-offset": 0,
      "content-type": "application/offset+octet-stream",
      "content-length": 512,
    };
    mockFormData = new FormData();
    mockFormData.append("chunk", new Blob(["chunk content"], { type: "application/offset+octet-stream" }));
    mockFormData.append("tus-resumable", "1.0.0");
    mockFormData.append("upload-offset", "0");
    mockFormData.append("content-type", "application/offset+octet-stream");
    mockFormData.append("content-length", "512");

    jest.clearAllMocks();
  });

  it("should upload photo chunk successfully", async () => {
    (PhotoUpdaterService.getInstance as jest.Mock).mockReturnValue(
      mockUpdaterService
    );
    mockUpdaterService.updatePhoto.mockResolvedValue({
      uploadOffset: 512,
    });

    const response = await uploadPhotoChunk(
      uploadId,
      mockFormData
    );

    expect(response.success).toBe(true);
    if(response.success){
      expect(response.uploadOffset).toBe(512);
    }
    expect(PhotoUpdaterService.getInstance).toHaveBeenCalled();
    expect(mockUpdaterService.updatePhoto).toHaveBeenCalled();
  });

  it("should handle multiple chunks", async () => {

    const updatedFormData = new FormData();
    updatedFormData.append("chunk", new Blob(["next chunk content"], { type: "application/offset+octet-stream" }));
    updatedFormData.append("tus-resumable", "1.0.0");
    updatedFormData.append("upload-offset", "512");
    updatedFormData.append("content-type", "application/offset+octet-stream");
    updatedFormData.append("content-length", "512");

    (PhotoUpdaterService.getInstance as jest.Mock).mockReturnValue(
      mockUpdaterService
    );
    mockUpdaterService.updatePhoto.mockResolvedValue({
      uploadOffset: 1024,
    });

    const response = await uploadPhotoChunk(
      uploadId,
      updatedFormData
    );

    expect(response.success).toBe(true);
    if(response.success){
      expect(response.uploadOffset).toBe(1024);
    }
    expect(mockUpdaterService.updatePhoto).toHaveBeenCalledWith(
      expect.objectContaining({
        uploadOffset: 512,
      })
    );
  });

  it("should throw error on invalid data schema", async () => {

    const invalidFormData = new FormData();
    invalidFormData.append("chunk", new Blob(["chunk content"], { type: "image/jpeg" }));
    invalidFormData.append("tus-resumable", "1.0.0");
    invalidFormData.append("upload-offset", "not-a-number");
    invalidFormData.append("content-type", "image/jpeg");
    invalidFormData.append("content-length", "512");

    (PhotoUpdaterService.getInstance as jest.Mock).mockReturnValue(
      mockUpdaterService
    );

    await expect(
      uploadPhotoChunk(uploadId, invalidFormData)
    ).rejects.toThrow();
  });
});

describe("UploaderController - getUploadStatus", () => {
  let mockStatusData: TusStatusData;
  const uploadId = "upload-123";

  beforeEach(() => {
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

    const response = await getUploadStatus(
      uploadId
    );

    expect(response.success).toBe(true);
    if(response.success){
      expect(response.uploadOffset).toBe(512);
    }
    expect(PhotoStatusService.getInstance).toHaveBeenCalled();
    expect(mockStatusService.getPhotoStatus).toHaveBeenCalled();
  });

  it("should throw error when upload not found", async () => {
    (PhotoStatusService.getInstance as jest.Mock).mockReturnValue(
      mockStatusService
    );
    mockStatusService.getPhotoStatus.mockResolvedValue(null);

    await expect(
      getUploadStatus(uploadId)
    ).rejects.toThrow("Upload not found");
  });

  it("should throw error on invalid data schema", async () => {
   
    (PhotoStatusService.getInstance as jest.Mock).mockReturnValue(
      mockStatusService
    );

    await expect(
      getUploadStatus(uploadId, "")
    ).rejects.toThrow();
  });
});

describe("UploaderController - deleteUpload", () => {
  let mockDeleteData: TusDeleteData;
  const uploadId = "upload-123";

  beforeEach(() => {
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

    const response = await deleteUpload(
      uploadId
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
      deleteUpload(uploadId)
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
      deleteUpload(uploadId)
    ).rejects.toThrow("Delete operation failed");
  });
});
