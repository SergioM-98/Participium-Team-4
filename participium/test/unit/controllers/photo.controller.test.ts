import { getPhoto } from "@/controllers/photo.controller";
import { PhotoRetrievalService } from "@/services/photoRetrieval.service";

jest.mock("@/services/photoRetrieval.service");

describe("Photo Controller", () => {
  let photoRetrievalService: jest.Mocked<PhotoRetrievalService>;

  beforeEach(() => {
    jest.clearAllMocks();
    photoRetrievalService = {
      getPhoto: jest.fn(),
    } as any;
    (PhotoRetrievalService.getInstance as jest.Mock).mockReturnValue(
      photoRetrievalService
    );
  });

  describe("getPhoto", () => {
    it("should return photo successfully", async () => {
      const mockResponse = {
        success: true,
        data: "base64encodedphoto",
      };
      photoRetrievalService.getPhoto.mockResolvedValue(mockResponse);

      const result = await getPhoto("test-photo.jpg");

      expect(result).toEqual(mockResponse);
      expect(photoRetrievalService.getPhoto).toHaveBeenCalledWith(
        "test-photo.jpg"
      );
      expect(photoRetrievalService.getPhoto).toHaveBeenCalledTimes(1);
    });

    it("should return error when photo retrieval fails", async () => {
      const mockError = new Error("Photo not found");
      photoRetrievalService.getPhoto.mockRejectedValue(mockError);

      const result = await getPhoto("nonexistent-photo.jpg");

      expect(result).toEqual({
        success: false,
        error: "Failed to retrieve photo",
      });
      expect(photoRetrievalService.getPhoto).toHaveBeenCalledWith(
        "nonexistent-photo.jpg"
      );
    });

    it("should handle service errors gracefully", async () => {
      photoRetrievalService.getPhoto.mockRejectedValue(
        new Error("Database connection failed")
      );

      const result = await getPhoto("some-photo.png");

      expect(result).toEqual({
        success: false,
        error: "Failed to retrieve photo",
      });
    });

    it("should work with different file extensions", async () => {
      const mockResponse = {
        success: true,
        data: "base64data",
      };
      photoRetrievalService.getPhoto.mockResolvedValue(mockResponse);

      await getPhoto("photo.png");
      expect(photoRetrievalService.getPhoto).toHaveBeenCalledWith("photo.png");

      await getPhoto("image.jpeg");
      expect(photoRetrievalService.getPhoto).toHaveBeenCalledWith("image.jpeg");

      await getPhoto("pic.webp");
      expect(photoRetrievalService.getPhoto).toHaveBeenCalledWith("pic.webp");
    });
  });
});
