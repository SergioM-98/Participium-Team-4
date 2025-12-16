import { UserRepository } from "../../../src/app/lib/repositories/user.repository";
import { RegistrationInput } from "../../../src/app/lib/dtos/user.dto";

jest.mock("@/db/db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    comment: {
      updateMany: jest.fn(),
    },
  },
}));

const mockedPrisma = jest.requireMock("@/db/db").prisma;

describe("UserRepository Story 1", () => {
  let userRepository: UserRepository;
  const mockUserData: RegistrationInput = {
    username: "testuser",
    password: "Test@1234",
    confirmPassword: "Test@1234",
    firstName: "Test",
    lastName: "User",
    email: "testuser@example.com",
    role: ["CITIZEN"],
    office: undefined,
    telegram: undefined,
  };

    beforeEach(() => {
        userRepository = UserRepository.getInstance();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

  describe("checkDuplicates", () => {
    it("should return isExisting true when username exists", async () => {
      mockedPrisma.user.findFirst.mockResolvedValue(mockUserData);

      const response = await userRepository.checkDuplicates(mockUserData);
      expect(response.isExisting).toBe(true);
    });

    it("should return isExisting false when username does not exist", async () => {
      mockedPrisma.user.findFirst.mockResolvedValue(null);

      const response = await userRepository.checkDuplicates(mockUserData);
      expect(response).toHaveProperty("isExisting");
      expect(response.isExisting).toBe(false);
    });
  });
  describe("createUser", () => {
    it("should create a new user and return success true", async () => {
      mockedPrisma.user.create.mockResolvedValue({
        ...mockUserData,
        id: 1,
        passwordHash: "hashedpassword",
      });
      const response = await userRepository.createUser(mockUserData);
      expect(response).toHaveProperty("success");
      expect(response).toHaveProperty("data");
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toBe(mockUserData.username);
      }
    });
    it("should throw an error when database operation fails", async () => {
      mockedPrisma.user.create.mockRejectedValue(new Error("DB error"));
      await expect(userRepository.createUser(mockUserData)).rejects.toThrow();
    });
  });
});

describe("UserRepository Story 2 - OFFICER Registration by ADMIN", () => {
  let userRepository: UserRepository;
  const mockUserData: RegistrationInput = {
    username: "testofficer",
    password: "Test@1234",
    confirmPassword: "Test@1234",
    firstName: "Test",
    lastName: "Officer",
    email: undefined,
    role: ["TECHNICAL_OFFICER"],
    office: "DEPARTMENT_OF_COMMERCE",
    telegram: undefined,
  };

    beforeEach(() => {
        userRepository = UserRepository.getInstance();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

  describe("checkDuplicates", () => {
    it("should return isExisting true when OFFICER username exists", async () => {
      mockedPrisma.user.findFirst.mockResolvedValue({
        ...mockUserData,
        id: 1,
        passwordHash: "hashedpassword",
      });

      const response = await userRepository.checkDuplicates(mockUserData);
      expect(response.isExisting).toBe(true);
      expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { username: mockUserData.username },
      });
    });

    it("should return isExisting false when OFFICER username does not exist", async () => {
      mockedPrisma.user.findFirst.mockResolvedValue(null);

      const response = await userRepository.checkDuplicates(mockUserData);
      expect(response).toHaveProperty("isExisting");
      expect(response.isExisting).toBe(false);
      expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { username: mockUserData.username },
      });
    });
  });

  describe("createUser", () => {
    it("should create a new OFFICER and return success true", async () => {
      mockedPrisma.user.create.mockResolvedValue({
        ...mockUserData,
        id: 1,
        passwordHash: "hashedpassword",
        email: null,
        telegram: null,
      });
      const response = await userRepository.createUser(mockUserData);
      expect(response).toHaveProperty("success");
      expect(response).toHaveProperty("data");
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toBe(mockUserData.username);
      }
      expect(mockedPrisma.user.create).toHaveBeenCalled();
    });

    it("should throw an error when database operation fails for OFFICER", async () => {
      mockedPrisma.user.create.mockRejectedValue(new Error("DB error"));
      await expect(userRepository.createUser(mockUserData)).rejects.toThrow();
    });

    it("should handle constraint violation errors", async () => {
      mockedPrisma.user.create.mockRejectedValue(
        new Error("Unique constraint failed")
      );
      await expect(userRepository.createUser(mockUserData)).rejects.toThrow();
    });
  });
});

describe("UserRepository Story 10 - Officer Management", () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = UserRepository.getInstance();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllOfficers", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should retrieve all officers successfully", async () => {
      const mockOfficers = [
        {
          id: "1",
          name: "Officer 1",
          surname: "Test",
          role: ["TECHNICAL_OFFICER"],
          office: ["PUBLIC_WORKS"],
        },
        {
          id: "2",
          name: "Officer 2",
          surname: "Test",
          role: ["TECHNICAL_OFFICER"],
          office: ["EDUCATION"],
        },
      ];

      mockedPrisma.user.findMany.mockResolvedValue(mockOfficers);
      const result = await userRepository.getAllOfficers();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOfficers);
      expect(mockedPrisma.user.findMany).toHaveBeenCalledWith({
        where: {
          role: { has: "TECHNICAL_OFFICER" },
        },
        include: {
          company: true,
        },
      });
    });

    it("should handle database errors", async () => {
      mockedPrisma.user.findMany.mockRejectedValue(
        new Error("Database error")
      );
      const result = await userRepository.getAllOfficers();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to retrieve officers");
    });

    it("should return empty array when no officers exist", async () => {
      mockedPrisma.user.findMany.mockResolvedValue([]);
      const result = await userRepository.getAllOfficers();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe("deleteOfficer", () => {
    it("should delete officer successfully", async () => {
      mockedPrisma.comment.updateMany.mockResolvedValue({ count: 0 });
      mockedPrisma.user.delete.mockResolvedValue({
        id: "officer-1",
        email: "officer@test.com",
        role: ["TECHNICAL_OFFICER"],
        office: ["PUBLIC_WORKS"],
      });

      const result = await userRepository.deleteOfficer("officer-1");

      expect(result).toBe(true);
      expect(mockedPrisma.comment.updateMany).toHaveBeenCalledWith({
        where: { authorId: "officer-1" },
        data: { authorId: null },
      });
      expect(mockedPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: "officer-1" },
      });
    });

    it("should handle database errors", async () => {
      mockedPrisma.user.delete.mockRejectedValue(new Error("Delete failed"));
      await expect(userRepository.deleteOfficer("officer-1")).rejects.toThrow();
    });

    it("should handle non-existent officer", async () => {
      mockedPrisma.user.delete.mockRejectedValue(
        new Error("Record not found")
      );
      await expect(userRepository.deleteOfficer("non-existent")).rejects.toThrow();
    });
  });

  describe("updateOfficerOffices", () => {
    it("should update officer offices successfully", async () => {
      const newOffices = ["PUBLIC_WORKS", "EDUCATION"];
      mockedPrisma.user.update.mockResolvedValue({
        id: "officer-1",
        email: "officer@test.com",
        role: ["TECHNICAL_OFFICER"],
        office: newOffices,
      });

      const result = await userRepository.updateOfficerOffices(
        "officer-1",
        newOffices
      );

      expect(result).toBe(true);
      expect(mockedPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "officer-1" },
        data: { office: newOffices },
      });
    });

    it("should handle database errors", async () => {
      mockedPrisma.user.update.mockRejectedValue(new Error("Update failed"));
      await expect(
        userRepository.updateOfficerOffices("officer-1", ["PUBLIC_WORKS"])
      ).rejects.toThrow();
    });

    it("should handle empty office array", async () => {
      mockedPrisma.user.update.mockResolvedValue({
        id: "officer-1",
        email: "officer@test.com",
        role: ["TECHNICAL_OFFICER"],
        office: [],
      });

      const result = await userRepository.updateOfficerOffices("officer-1", []);

      expect(result).toBe(true);
      expect(mockedPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "officer-1" },
        data: { office: [] },
      });
    });

    it("should handle non-existent officer", async () => {
      mockedPrisma.user.update.mockRejectedValue(
        new Error("Record not found")
      );
      await expect(
        userRepository.updateOfficerOffices("non-existent", ["PUBLIC_WORKS"])
      ).rejects.toThrow();
    });
  });
});
