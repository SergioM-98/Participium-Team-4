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
    confirmPassword: "Test@1234",
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
    confirmPassword: "Test@1234",
    firstName: "Test",
    lastName: "User",
    email: undefined,
    role: "TECHNICAL_OFFICER",
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

describe("UserController Story 2 - OFFICER Registration by ADMIN", () => {
  let userController: UserController;
  const mockUserData: RegistrationInput = {
    username: "testofficer",
    password: "Test@1234",
    confirmPassword: "Test@1234",
    firstName: "Test",
    lastName: "Officer",
    email: undefined,
    role: "TECHNICAL_OFFICER",
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
    it("should call repository's checkDuplicates method for OFFICER data", async () => {
      mockRepository.checkDuplicates.mockResolvedValue({ isExisting: false });
      const result = await userController.checkDuplicates(mockUserData);
      expect(mockRepository.checkDuplicates).toHaveBeenCalledWith(mockUserData);
      expect(result.isExisting).toBe(false);
    });

    it("should return true when OFFICER username already exists", async () => {
      mockRepository.checkDuplicates.mockResolvedValue({ isExisting: true });
      const result = await userController.checkDuplicates(mockUserData);
      expect(mockRepository.checkDuplicates).toHaveBeenCalledWith(mockUserData);
      expect(result.isExisting).toBe(true);
    });
  });

  describe("createUser", () => {
    it("should validate OFFICER input and call repository's createUser method", async () => {
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
      expect(mockRepository.createUser).toHaveBeenCalledWith(mockUserData);
    });

    it("should return error when OFFICER has no office", async () => {
      const invalidUserData = { ...mockUserData, office: undefined };
      const response: RegistrationResponse = await userController.createUser(
        invalidUserData
      );
      expect(response.success).toBe(false);
      expect(response).toHaveProperty("error");
      expect(mockRepository.createUser).not.toHaveBeenCalled();
    });

    it("should return error when OFFICER has email", async () => {
      const invalidUserData = { ...mockUserData, email: "test@example.com" };
      const response: RegistrationResponse = await userController.createUser(
        invalidUserData
      );
      expect(response.success).toBe(false);
      expect(response).toHaveProperty("error");
      expect(mockRepository.createUser).not.toHaveBeenCalled();
    });

    it("should return error when OFFICER has telegram", async () => {
      const invalidUserData = { ...mockUserData, telegram: "@testofficer" };
      const response: RegistrationResponse = await userController.createUser(
        invalidUserData
      );
      expect(response.success).toBe(false);
      expect(response).toHaveProperty("error");
      expect(mockRepository.createUser).not.toHaveBeenCalled();
    });

    it("should return error on invalid username", async () => {
      const invalidUserData = { ...mockUserData, username: "ab" };
      const response: RegistrationResponse = await userController.createUser(
        invalidUserData
      );
      expect(response.success).toBe(false);
      expect(response).toHaveProperty("error");
      expect(mockRepository.createUser).not.toHaveBeenCalled();
    });

    it("should handle repository failure gracefully", async () => {
      mockRepository.createUser.mockResolvedValue({
        success: false,
        error: "Database error",
      });
      const response: RegistrationResponse = await userController.createUser(
        mockUserData
      );
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Database error");
      }
    });
  });
});
