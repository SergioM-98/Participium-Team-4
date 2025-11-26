import { ProfilePhotoRepository } from "../../../src/app/lib/repositories/profilePhotos.repository";
import { prisma } from "../../../prisma/db";



jest.mock("../../../prisma/db", () => ({ prisma: {
  profilePhoto: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
} }));


describe("ProfilePhotoRepository - Story 9", () => {
  let repo: ProfilePhotoRepository;
  beforeEach(() => {
    repo = ProfilePhotoRepository.getInstance();
    jest.clearAllMocks();
  });

  it("should create profile photo", async () => {
    const mockUpsert = jest.spyOn(prisma.profilePhoto, "upsert").mockResolvedValue({ id: "photo-id-1", url: "uploads/test.jpg", userId: "user-id-1" });
    const result = await repo.create({ id: "photo-id-1", url: "uploads/test.jpg", userId: "user-id-1" });
    expect(result.id).toBe("photo-id-1");
    expect(mockUpsert).toHaveBeenCalled();
  });

  it("should find profile photo by id", async () => {
    const mockFindUnique = jest.spyOn(prisma.profilePhoto, "findUnique").mockResolvedValue({ id: "photo-id-2", url: "uploads/test2.jpg", userId: "user-id-2" });
    const result = await repo.findById("photo-id-2");
    expect(result?.id).toBe("photo-id-2");
    expect(mockFindUnique).toHaveBeenCalled();
  });

  it("should delete profile photo", async () => {
    const mockDelete = jest.spyOn(prisma.profilePhoto, "delete").mockResolvedValue({ id: "photo-id-3", url: "uploads/test3.jpg", userId: "user-id-3" });
    const result = await repo.delete("photo-id-3");
    expect(result.id).toBe("photo-id-3");
    expect(mockDelete).toHaveBeenCalled();
  });

  it("should find user's profile photo", async () => {
    const mockFindUnique = jest.spyOn(prisma.profilePhoto, "findUnique").mockResolvedValue({ id: "photo-id-4", url: "uploads/test4.jpg", userId: "user-id-4" });
    const result = await repo.getPhotoOfUser("user-id-4");
    expect(result?.id).toBe("photo-id-4");
    expect(mockFindUnique).toHaveBeenCalled();
  });
});
