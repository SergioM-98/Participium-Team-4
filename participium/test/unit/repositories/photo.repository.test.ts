import { PhotoRepository } from "../../../src/app/lib/repositories/photo.repository";

jest.mock("@/prisma/db", () => ({
  prisma: {
    photo: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockedPrisma = jest.requireMock("@/prisma/db").prisma;

describe("PhotoRepository", () => {
  let photoRepository: PhotoRepository;

  const mockPhotoData = {
    id: "photo-123",
    url: "https://example.com/photo.jpg",
    reportId: 6,
    size: BigInt(102400),
    offset: BigInt(0),
    filename: "photo.jpg",
  };

  beforeEach(() => {
    photoRepository = PhotoRepository.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a photo successfully", async () => {
      mockedPrisma.photo.create = jest.fn().mockResolvedValue(mockPhotoData);

      const response = await photoRepository.create(mockPhotoData);

      expect(mockedPrisma.photo.create).toHaveBeenCalledWith({
        data: {
          id: mockPhotoData.id,
          url: mockPhotoData.url,
          reportId: BigInt(mockPhotoData.reportId),
          size: mockPhotoData.size,
          offset: mockPhotoData.offset,
          filename: mockPhotoData.filename,
        },
      });
      expect(response).toEqual(mockPhotoData);
    });

    it("should throw an error when database creation fails", async () => {
      mockedPrisma.photo.create.mockRejectedValue(new Error("Database error"));

      await expect(photoRepository.create(mockPhotoData)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("update", () => {
    it("should update photo offset successfully", async () => {
      const newOffset = BigInt(51200);
      const updatedPhoto = {
        ...mockPhotoData,
        offset: newOffset,
      };

      mockedPrisma.photo.update.mockResolvedValue(updatedPhoto);

      const response = await photoRepository.update(mockPhotoData.id, {
        offset: newOffset,
      });

      expect(mockedPrisma.photo.update).toHaveBeenCalledWith({
        where: { id: mockPhotoData.id },
        data: {
          offset: newOffset,
        },
      });
      expect(response.offset).toBe(newOffset);
    });

    it("should throw an error when database update fails", async () => {
      mockedPrisma.photo.update.mockRejectedValue(new Error("Update failed"));

      await expect(
        photoRepository.update(mockPhotoData.id, { offset: BigInt(1000) })
      ).rejects.toThrow("Update failed");
    });
  });

  describe("findById", () => {
    it("should find a photo by id successfully", async () => {
      mockedPrisma.photo.findUnique.mockResolvedValue(mockPhotoData);

      const response = await photoRepository.findById(mockPhotoData.id);

      expect(mockedPrisma.photo.findUnique).toHaveBeenCalledWith({
        where: { id: mockPhotoData.id },
      });
      expect(response).toEqual(mockPhotoData);
    });

    it("should return null when photo is not found", async () => {
      mockedPrisma.photo.findUnique.mockResolvedValue(null);

      const response = await photoRepository.findById("non-existent-id");

      expect(mockedPrisma.photo.findUnique).toHaveBeenCalledWith({
        where: { id: "non-existent-id" },
      });
      expect(response).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete a photo successfully", async () => {
      mockedPrisma.photo.delete.mockResolvedValue(mockPhotoData);

      const response = await photoRepository.delete(mockPhotoData.id);

      expect(mockedPrisma.photo.delete).toHaveBeenCalledWith({
        where: { id: mockPhotoData.id },
      });
      expect(response).toEqual(mockPhotoData);
    });

    it("should throw an error when photo to delete does not exist", async () => {
      mockedPrisma.photo.delete.mockRejectedValue(new Error("Photo not found"));

      await expect(photoRepository.delete("non-existent-id")).rejects.toThrow(
        "Photo not found"
      );
    });

    it("should throw an error when database deletion fails", async () => {
      mockedPrisma.photo.delete.mockRejectedValue(new Error("Deletion failed"));

      await expect(photoRepository.delete(mockPhotoData.id)).rejects.toThrow(
        "Deletion failed"
      );
    });

    it("should delete multiple photos", async () => {
      const photo1Id = "photo-1";
      const photo2Id = "photo-2";

      mockedPrisma.photo.delete
        .mockResolvedValueOnce({ ...mockPhotoData, id: photo1Id })
        .mockResolvedValueOnce({ ...mockPhotoData, id: photo2Id });

      await photoRepository.delete(photo1Id);
      await photoRepository.delete(photo2Id);

      expect(mockedPrisma.photo.delete).toHaveBeenCalledTimes(2);
      expect(mockedPrisma.photo.delete).toHaveBeenNthCalledWith(1, {
        where: { id: photo1Id },
      });
      expect(mockedPrisma.photo.delete).toHaveBeenNthCalledWith(2, {
        where: { id: photo2Id },
      });
    });
  });
});
