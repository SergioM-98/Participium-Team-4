import { checkDuplicates, register } from "@/app/lib/controllers/user.controller";
import {
  RegistrationInput,
  RegistrationResponse,
} from "@/app/lib/dtos/user.dto";
import { UserService } from "@/app/lib/services/user.service";
import { getServerSession } from 'next-auth/next';


const mockUserService = {
  checkDuplicates: jest.fn(),
  createUser: jest.fn(),
};

jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(),
}));

jest.mock('@/auth', () => ({
    authOptions: {}
}));

jest.mock('@/app/lib/services/user.service', () => {
  return {
    UserService: {
      getInstance: jest.fn(),
    },
  };
});


describe("UserController Story 1", () => {
  let mockFormData: FormData;
  let mockUserData: RegistrationInput;
  beforeEach(() => {
    (UserService.getInstance as jest.Mock).mockReturnValue(mockUserService);
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
      mockUserService.checkDuplicates.mockResolvedValue({ isExisting: false });
      const response: RegistrationResponse = await register(
        mockFormData
      );
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toBe(mockUserData.username);
      }
    });
    it("should return error on invalid input data", async () => {
      mockFormData.set("username", "");
      const response: RegistrationResponse = await register(
        mockFormData
      );
      expect(response.success).toBe(false);
      expect(response).toHaveProperty("error");
    });
  });
});

describe("UserController Story 3", () => {
  let mockUserData: RegistrationInput;
  let mockFormData: FormData;

  const adminUserSession = {
      user: {
          id: '1',
          name: 'Admin User',
          role: 'ADMIN'
      },
      expires: '2024-12-31T23:59:59.999Z'
  };

  beforeEach(() => {
    (UserService.getInstance as jest.Mock).mockReturnValue(mockUserService);
    mockUserData = {
      username: "testuser",
      password: "Test@1234",
      confirmPassword: "Test@1234",
      firstName: "Test",
      lastName: "User",
      email: undefined,
      role: "PUBLIC_RELATIONS_OFFICER",
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
      (getServerSession as jest.Mock).mockResolvedValue(adminUserSession);
      mockUserService.createUser.mockResolvedValue({
        success: true,
        data: mockUserData.username,
      });
      mockUserService.checkDuplicates.mockResolvedValue({ isExisting: false });
      const response: RegistrationResponse = await register(
        mockFormData
      );
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toBe(mockUserData.username);
      }
    });
    it("should return error on invalid input data", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminUserSession);
      mockFormData.set("office", "");
      const response: RegistrationResponse = await register(
        mockFormData
      );
      expect(response.success).toBe(false);
      expect(response).toHaveProperty("error");
    });

    it("should return error on a request from a non admin user", async () => {
      const nonAdminUserSession = {
          user: {
              id: '3',
              name: 'Officer User',
              role: 'OFFICER'
          },
          expires: '2024-12-31T23:59:59.999Z'
      };
      (getServerSession as jest.Mock).mockResolvedValue(nonAdminUserSession);
      const response: RegistrationResponse = await register(
        mockFormData
      );
      expect(response.success).toBe(false);
      expect(response).toHaveProperty("error");
    });
  });
});

describe("UserController Story 2 - OFFICER Registration by ADMIN", () => {

  const adminUserSession = {
      user: {
          id: '1',
          name: 'Admin User',
          role: 'ADMIN'
      },
      expires: '2024-12-31T23:59:59.999Z'
  };
  let mockUserData: RegistrationInput;

  let formData: FormData;

  beforeEach(() => {
    (UserService.getInstance as jest.Mock).mockReturnValue(mockUserService);
    mockUserData = {
      username: "testofficer",
      password: "Test@1234",
      confirmPassword: "Test@1234",
      firstName: "Test",
      lastName: "Officer",
      email: undefined,
      role: "PUBLIC_RELATIONS_OFFICER",
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
      (getServerSession as jest.Mock).mockResolvedValue(adminUserSession);
      mockUserService.checkDuplicates.mockResolvedValue({ isExisting: false });
      const result = await checkDuplicates(mockUserData);
      expect(mockUserService.checkDuplicates).toHaveBeenCalledWith(mockUserData);
      expect(result.isExisting).toBe(false);
    });

    it("should return true when OFFICER username already exists", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminUserSession);
      mockUserService.checkDuplicates.mockResolvedValue({ isExisting: true });
      const result = await checkDuplicates(mockUserData);
      expect(mockUserService.checkDuplicates).toHaveBeenCalledWith(mockUserData);
      expect(result.isExisting).toBe(true);
    });
  });

  describe("createUser", () => {
    it("should validate OFFICER input and call repository's createUser method", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminUserSession);
      mockUserService.createUser.mockResolvedValue({
        success: true,
        data: mockUserData.username,
      });
      mockUserService.checkDuplicates.mockResolvedValue({ isExisting: false });
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
      (getServerSession as jest.Mock).mockResolvedValue(adminUserSession);
      formData.set("office", "");
      const response: RegistrationResponse = await register(
        formData
      );
      expect(response.success).toBe(false);
      expect(response).toHaveProperty("error");
      expect(mockUserService.createUser).not.toHaveBeenCalled();
    });

    it("should return error when OFFICER has email", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminUserSession);
      formData.set("email", "test@example.com");
      const response: RegistrationResponse = await register(
        formData
      );
      expect(response.success).toBe(false);
      expect(response).toHaveProperty("error");
      expect(mockUserService.createUser).not.toHaveBeenCalled();
    });

    it("should return error when OFFICER has telegram", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminUserSession);
      formData.set("telegram", "@testofficer");
      const response: RegistrationResponse = await register(
        formData
      );
      expect(response.success).toBe(false);
      expect(response).toHaveProperty("error");
      expect(mockUserService.createUser).not.toHaveBeenCalled();
    });

    it("should return error on invalid username", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminUserSession);
      formData.set("username", "ab");
      const response: RegistrationResponse = await register(
        formData
      );
      expect(response.success).toBe(false);
      expect(response).toHaveProperty("error");
      expect(mockUserService.createUser).not.toHaveBeenCalled();
    });

    it("should handle repository failure gracefully", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminUserSession);
      mockUserService.createUser.mockResolvedValue({
        success: false,
        error: "Database error",
      });
      mockUserService.checkDuplicates.mockResolvedValue({ isExisting: false });
      const response: RegistrationResponse = await register(
        formData
      );
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Database error");
      }
    });
    it("should return error on invalid username", async () => {
      const nonAdminUserSession = {
          user: {
              id: '2',
              name: 'Regular User',
              role: 'CITIZEN'
          },
          expires: '2024-12-31T23:59:59.999Z'
      };
      (getServerSession as jest.Mock).mockResolvedValue(nonAdminUserSession);
      const response: RegistrationResponse = await register(
        formData
      );
      expect(response.success).toBe(false);
      expect(response).toHaveProperty("error");
      expect(mockUserService.createUser).not.toHaveBeenCalled();
    });
  });
});
