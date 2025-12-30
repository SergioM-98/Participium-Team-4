import { savePhotoFile } from "@/utils/fileUtils";
import { writeFile, mkdir, stat } from "node:fs/promises";

jest.mock("node:fs/promises");

describe("FileUtils", () => {
  const mockFilePath = "/uploads/test/photo.jpg";
  const mockArrayBuffer = new Uint8Array([1, 2, 3, 4, 5]).buffer;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("savePhotoFile", () => {
    it("should save photo file successfully and return file size", async () => {
      (mkdir as jest.Mock).mockResolvedValue(undefined);
      (writeFile as jest.Mock).mockResolvedValue(undefined);
      (stat as jest.Mock).mockResolvedValue({ size: 12345 });

      const result = await savePhotoFile(mockArrayBuffer, mockFilePath);

      expect(result).toBe(12345);
      expect(mkdir).toHaveBeenCalledWith("/uploads/test", { recursive: true });
      expect(writeFile).toHaveBeenCalledWith(
        mockFilePath,
        expect.any(Buffer)
      );
      expect(stat).toHaveBeenCalledWith(mockFilePath);
    });

    it("should create directory recursively if it doesn't exist", async () => {
      (mkdir as jest.Mock).mockResolvedValue(undefined);
      (writeFile as jest.Mock).mockResolvedValue(undefined);
      (stat as jest.Mock).mockResolvedValue({ size: 5000 });

      await savePhotoFile(mockArrayBuffer, "/deep/nested/path/photo.jpg");

      expect(mkdir).toHaveBeenCalledWith("/deep/nested/path", {
        recursive: true,
      });
    });

    it("should throw error when mkdir fails", async () => {
      (mkdir as jest.Mock).mockRejectedValue(new Error("Permission denied"));

      await expect(
        savePhotoFile(mockArrayBuffer, mockFilePath)
      ).rejects.toThrow("Failed to save photo file: Permission denied");
    });

    it("should throw error when writeFile fails", async () => {
      (mkdir as jest.Mock).mockResolvedValue(undefined);
      (writeFile as jest.Mock).mockRejectedValue(new Error("Disk full"));
      
      await expect(
        savePhotoFile(mockArrayBuffer, mockFilePath)
      ).rejects.toThrow("Failed to save photo file: Disk full");
    });

    it("should throw error when stat fails", async () => {
      (mkdir as jest.Mock).mockResolvedValue(undefined);
      (writeFile as jest.Mock).mockResolvedValue(undefined);
      (stat as jest.Mock).mockRejectedValue(new Error("File not found"));

      await expect(
        savePhotoFile(mockArrayBuffer, mockFilePath)
      ).rejects.toThrow("Failed to save photo file: File not found");
    });

    it("should handle different file sizes correctly", async () => {
      (mkdir as jest.Mock).mockResolvedValue(undefined);
      (writeFile as jest.Mock).mockResolvedValue(undefined);
      
      // Test small file
      (stat as jest.Mock).mockResolvedValue({ size: 100 });
      let result = await savePhotoFile(mockArrayBuffer, mockFilePath);
      expect(result).toBe(100);

      // Test large file
      (stat as jest.Mock).mockResolvedValue({ size: 5000000 });
      result = await savePhotoFile(mockArrayBuffer, mockFilePath);
      expect(result).toBe(5000000);
    });

    it("should convert ArrayBuffer to Buffer correctly", async () => {
      (mkdir as jest.Mock).mockResolvedValue(undefined);
      (writeFile as jest.Mock).mockResolvedValue(undefined);
      (stat as jest.Mock).mockResolvedValue({ size: 5 });

      await savePhotoFile(mockArrayBuffer, mockFilePath);

      const writeFileCall = (writeFile as jest.Mock).mock.calls[0];
      const savedBuffer = writeFileCall[1];
      
      expect(Buffer.isBuffer(savedBuffer)).toBe(true);
      expect(savedBuffer.length).toBe(5);
    });

    it("should handle unknown error gracefully", async () => {
      (mkdir as jest.Mock).mockRejectedValue("Unknown error string");

      await expect(
        savePhotoFile(mockArrayBuffer, mockFilePath)
      ).rejects.toThrow("Failed to save photo file: Unknown error");
    });
  });
});
