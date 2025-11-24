import { checkDuplicates, register } from "@/app/lib/controllers/user.controller";
import {
  RegistrationInput,
  RegistrationResponse,
} from "@/app/lib/dtos/user.dto";
import { UserService } from "@/app/lib/services/user.service";
import { mock } from "node:test";


const mockUserService = {
  checkDuplicates: jest.fn(),
  createUser: jest.fn(),
};

jest.mock('@/app/lib/services/user.service', () => {
  return {
    UserService: {
      getInstance: jest.fn(),
    },
  };
});

(UserService.getInstance as jest.Mock).mockReturnValue(mockUserService);

describe("UserController Story 1", () => {
  let mockFormData: FormData;
  let mockUserData: RegistrationInput;
  beforeEach(() => {
    mockFormData = new FormData();
    mockUserData = {
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
    mockFormData.append("username", mockUserData.username);
    mockFormData.append("password", mockUserData.password);
    mockFormData.append("confirmPassword", mockUserData.confirmPassword);
    mockFormData.append("firstName", mockUserData.firstName);
    mockFormData.append("lastName", mockUserData.lastName);
    mockFormData.append("email", mockUserData.email || "");
    mockFormData.append("role", mockUserData.role);
    mockFormData.append("office", mockUserData.office || "");
    mockFormData.append("telegram", mockUserData.telegram || ""); 
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("checkDuplicates", () => {
    it("should call repository's checkDuplicates method, return false with new user data", async () => {
      mockUserService.checkDuplicates.mockResolvedValue({ isExisting: false });
      await checkDuplicates(mockUserData);
      expect(mockUserService.checkDuplicates).toHaveBeenCalledWith(mockUserData);
    });
    it("should call repository's checkDuplicates method, return true with existing user data", async () => {
      mockUserService.checkDuplicates.mockResolvedValue({ isExisting: true });
      await checkDuplicates(mockUserData);
      expect(mockUserService.checkDuplicates).toHaveBeenCalledWith(mockUserData);
    });
  });
  describe("createUser", () => {
    it("should validate input and call repository's createUser method, return success true", async () => {
      mockUserService.createUser.mockResolvedValue({
        success: true,
        data: mockUserData.username,
      });
      const response: RegistrationResponse = await register(
        mockFormData
      );
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toBe(mockUserData.username);
      }
    });
    it("should return error on invalid input data", async () => {
      const invalidFormData = mockFormData;
      invalidFormData.set("username", "");
      const response: RegistrationResponse = await register(
        invalidFormData
      );
      expect(response.success).toBe(false);
      expect(response).toHaveProperty("error");
    });
  });
});

describe("UserController Story 3", () => {
  let mockUserData: RegistrationInput;
  let mockFormData: FormData;

  beforeEach(() => {
      mockUserData = {
      username: "testuser",
      password: "Test@1234",
      confirmPassword: "Test@1234",
      firstName: "Test",
      lastName: "User",
      email: undefined,
      role: "OFFICER",
      office: "DEPARTMENT_OF_COMMERCE",
      telegram: undefined,
    };
    mockFormData = new FormData();
    mockFormData.append("username", mockUserData.username);
    mockFormData.append("password", mockUserData.password);
    mockFormData.append("confirmPassword", mockUserData.confirmPassword);
    mockFormData.append("firstName", mockUserData.firstName);
    mockFormData.append("lastName", mockUserData.lastName);
    mockFormData.append("email", mockUserData.email || "");
    mockFormData.append("role", mockUserData.role);
    mockFormData.append("office", mockUserData.office || "");
    mockFormData.append("telegram", mockUserData.telegram || ""); 
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("checkDuplicates", () => {
    it("should call repository's checkDuplicates method, return false with new user data", async () => {
      mockUserService.checkDuplicates.mockResolvedValue({ isExisting: false });
      await checkDuplicates(mockUserData);
      expect(mockUserService.checkDuplicates).toHaveBeenCalledWith(mockUserData);
    });
    it("should call repository's checkDuplicates method, return true with existing user data", async () => {
      mockUserService.checkDuplicates.mockResolvedValue({ isExisting: true });
      await checkDuplicates(mockUserData);
      expect(mockUserService.checkDuplicates).toHaveBeenCalledWith(mockUserData);
    });
  });
  describe("createUser", () => {
    it("should validate input and call repository's createUser method, return success true", async () => {
      mockUserService.createUser.mockResolvedValue({
        success: true,
        data: mockUserData.username,
      });
      const response: RegistrationResponse = await register(
        mockFormData
      );
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toBe(mockUserData.username);
      }
    });
    it("should return error on invalid input data", async () => {
      const invalidFormData = mockFormData;
      invalidFormData.set("office", "");
      const response: RegistrationResponse = await register(
        invalidFormData
      );
      expect(response.success).toBe(false);
      expect(response).toHaveProperty("error");
    });
  });
});

describe("UserController Story 2 - OFFICER Registration by ADMIN", () => {

  
  let mockUserData: RegistrationInput;

  let formData: FormData;

  beforeEach(() => {
    mockUserData = {
      username: "testofficer",
      password: "Test@1234",
      confirmPassword: "Test@1234",
      firstName: "Test",
      lastName: "Officer",
      email: undefined,
      role: "OFFICER",
      office: "DEPARTMENT_OF_COMMERCE",
      telegram: undefined,
    }
    formData = new FormData();
    formData.append("username", mockUserData.username);
    formData.append("password", mockUserData.password);
    formData.append("confirmPassword", mockUserData.confirmPassword);
    formData.append("firstName", mockUserData.firstName);
    formData.append("lastName", mockUserData.lastName);
    formData.append("email", mockUserData.email || "");
    formData.append("role", mockUserData.role);
    formData.append("office", mockUserData.office || "");
    formData.append("telegram", mockUserData.telegram || "");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("checkDuplicates", () => {
    it("should call repository's checkDuplicates method for OFFICER data", async () => {
      mockUserService.checkDuplicates.mockResolvedValue({ isExisting: false });
      const result = await checkDuplicates(mockUserData);
      expect(mockUserService.checkDuplicates).toHaveBeenCalledWith(mockUserData);
      expect(result.isExisting).toBe(false);
    });

    it("should return true when OFFICER username already exists", async () => {
      mockUserService.checkDuplicates.mockResolvedValue({ isExisting: true });
      const result = await checkDuplicates(mockUserData);
      expect(mockUserService.checkDuplicates).toHaveBeenCalledWith(mockUserData);
      expect(result.isExisting).toBe(true);
    });
  });

  describe("createUser", () => {
    it("should validate OFFICER input and call repository's createUser method", async () => {
      mockUserService.createUser.mockResolvedValue({
        success: true,
        data: mockUserData.username,
      });
      const response: RegistrationResponse = await register(
        formData
      );
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toBe(mockUserData.username);
      }
      expect(mockUserService.createUser).toHaveBeenCalledWith(mockUserData);
    });

    it("should return error when OFFICER has no office", async () => {
      const invalidFormData = formData;
      invalidFormData.set("office", "");
      const response: RegistrationResponse = await register(
        invalidFormData
      );
      expect(response.success).toBe(false);
      expect(response).toHaveProperty("error");
      expect(mockUserService.createUser).not.toHaveBeenCalled();
    });

    it("should return error when OFFICER has email", async () => {
      const invalidFormData = formData;
      invalidFormData.set("email", "test@example.com");
      const response: RegistrationResponse = await register(
        invalidFormData
      );
      expect(response.success).toBe(false);
      expect(response).toHaveProperty("error");
      expect(mockUserService.createUser).not.toHaveBeenCalled();
    });

    it("should return error when OFFICER has telegram", async () => {
      const invalidFormData = formData;
      invalidFormData.set("telegram", "@testofficer");
      const response: RegistrationResponse = await register(
        invalidFormData
      );
      expect(response.success).toBe(false);
      expect(response).toHaveProperty("error");
      expect(mockUserService.createUser).not.toHaveBeenCalled();
    });

    it("should return error on invalid username", async () => {
      const invalidFormData = formData;
      invalidFormData.set("username", "ab");
      const response: RegistrationResponse = await register(
        invalidFormData
      );
      expect(response.success).toBe(false);
      expect(response).toHaveProperty("error");
      expect(mockUserService.createUser).not.toHaveBeenCalled();
    });

    it("should handle repository failure gracefully", async () => {
      mockUserService.createUser.mockResolvedValue({
        success: false,
        error: "Database error",
      });
      const response: RegistrationResponse = await register(
        formData
      );
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Database error");
      }
    });
  });
});
