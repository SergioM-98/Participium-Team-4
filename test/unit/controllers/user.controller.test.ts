import { UserController } from "@/app/lib/controllers/user.controller";
import {
  RegistrationInput,
  RegistrationResponse,
  RegistrationInputSchema,
} from "@/app/lib/dtos/user.dto";

const mockRepository = {
  checkDuplicates: jest.fn(),
  createUser: jest.fn(),
};

jest.mock("@/app/lib/repositories/user.repository", () => {
  return {
    UserRepository: jest.fn().mockImplementation(() => mockRepository),
  };
});

describe("UserController Story 1", () => {
  let userController: UserController;
  const mockUserData: RegistrationInput = {
    username: "testuser",
    password: "Test@1234",
    firstName: "Test",
    lastName: "User",
    email: "testuser@example.com",
    role: "CITIZEN",
    office: undefined,
    telegram: undefined,
  };
  beforeEach(() => {
    userController = new UserController();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("checkDuplicates", () => {
    it("should call repository's checkDuplicates method, return false with new user data", async () => {
      mockRepository.checkDuplicates.mockResolvedValue({ isExisting: false });
      await userController.checkDuplicates(mockUserData);
      expect(mockRepository.checkDuplicates).toHaveBeenCalledWith(mockUserData);
    });
    it("should call repository's checkDuplicates method, return true with existing user data", async () => {
      mockRepository.checkDuplicates.mockResolvedValue({ isExisting: true });
      await userController.checkDuplicates(mockUserData);
      expect(mockRepository.checkDuplicates).toHaveBeenCalledWith(mockUserData);
    });
  });
  describe("createUser", () => {
    it("should validate input and call repository's createUser method, return success true", async () => {
      mockRepository.createUser.mockResolvedValue({
        success: true,
        data: mockUserData.username,
      });
      const response: RegistrationResponse = await userController.createUser(
        mockUserData
      );
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toBe(mockUserData.username);
      }
    });
    it("should return error on invalid input data", async () => {
      const invalidUserData = { ...mockUserData, username: "" };
      const response: RegistrationResponse = await userController.createUser(
        invalidUserData
      );
      expect(response.success).toBe(false);
      expect(response).toHaveProperty("error");
    });
  });
});

describe("UserController Story 3", () => {
  let userController: UserController;
  const mockUserData: RegistrationInput = {
    username: "testuser",
    password: "Test@1234",
    firstName: "Test",
    lastName: "User",
    email: "",
    role: "OFFICER",
    office: "DEPARTMENT_OF_COMMERCE",
    telegram: undefined,
  };
  beforeEach(() => {
    userController = new UserController();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("checkDuplicates", () => {
    it("should call repository's checkDuplicates method, return false with new user data", async () => {
      mockRepository.checkDuplicates.mockResolvedValue({ isExisting: false });
      await userController.checkDuplicates(mockUserData);
      expect(mockRepository.checkDuplicates).toHaveBeenCalledWith(mockUserData);
    });
    it("should call repository's checkDuplicates method, return true with existing user data", async () => {
      mockRepository.checkDuplicates.mockResolvedValue({ isExisting: true });
      await userController.checkDuplicates(mockUserData);
      expect(mockRepository.checkDuplicates).toHaveBeenCalledWith(mockUserData);
    });
  });
  describe("createUser", () => {
    it("should validate input and call repository's createUser method, return success true", async () => {
      mockRepository.createUser.mockResolvedValue({
        success: true,
        data: mockUserData.username,
      });
      const response: RegistrationResponse = await userController.createUser(
        mockUserData
      );
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toBe(mockUserData.username);
      }
    });
    it("should return error on invalid input data", async () => {
      const invalidUserData = { ...mockUserData, username: "" };
      const response: RegistrationResponse = await userController.createUser(
        invalidUserData
      );
      expect(response.success).toBe(false);
      expect(response).toHaveProperty("error");
    });
  });
});
