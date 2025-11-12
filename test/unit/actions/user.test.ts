import { register } from "@/app/lib/actions/user";
import { RegistrationResponse } from "@/app/lib/dtos/user.dto";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/auth", () => ({
  authOptions: {},
}));

import { getServerSession } from "next-auth/next";

const mockUserController = {
  checkDuplicates: jest.fn(),
  createUser: jest.fn(),
};

jest.mock("@/controllers/user.controller", () => {
  return {
    UserController: jest.fn().mockImplementation(() => mockUserController),
  };
});

describe("User Actions - register function Story 1", () => {
  let validFormData: FormData;

  const adminSession = {
    user: {
      id: "1",
      name: "Admin User",
      role: "ADMIN",
    },
    expires: "2024-12-31T23:59:59.999Z",
  };

  const citizenSession = {
    user: {
      id: "2",
      name: "Citizen User",
      role: "CITIZEN",
    },
    expires: "2024-12-31T23:59:59.999Z",
  };

  beforeEach(() => {
    validFormData = new FormData();
    validFormData.append("firstName", "Test");
    validFormData.append("lastName", "User");
    validFormData.append("email", "test@example.com");
    validFormData.append("username", "testuser");
    validFormData.append("password", "Test@1234");
    validFormData.append("role", "CITIZEN");
    validFormData.append("office", "");
    validFormData.append("telegram", "");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should register a new CITIZEN user successfully", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    mockUserController.checkDuplicates.mockResolvedValue({ isExisting: false });
    mockUserController.createUser.mockResolvedValue({
      success: true,
      data: "testuser",
    });
    const response: RegistrationResponse = await register(validFormData);
    console.log("Response from register action:", response);
    expect(response.success).toBe(true);
    expect(mockUserController.checkDuplicates).toHaveBeenCalled();
    expect(mockUserController.createUser).toHaveBeenCalled();
  });
  it("should prevent logged in users from registering again", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(citizenSession);
    const response: RegistrationResponse = await register(validFormData);
    expect(response.success).toBe(false);
    expect(response).toHaveProperty("error");
    expect(mockUserController.checkDuplicates).not.toHaveBeenCalled();
    expect(mockUserController.createUser).not.toHaveBeenCalled();
  });
  it("should block invalid input data", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    validFormData.set("username", "");
    const response: RegistrationResponse = await register(validFormData);
    expect(response.success).toBe(false);
    expect(response).toHaveProperty("error");
    expect(mockUserController.checkDuplicates).not.toHaveBeenCalled();
    expect(mockUserController.createUser).not.toHaveBeenCalled();
  });
  it("should block duplicate usernames", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    mockUserController.checkDuplicates.mockResolvedValue({ isExisting: true });
    const response: RegistrationResponse = await register(validFormData);
    expect(response.success).toBe(false);
    expect(response).toHaveProperty("error");
    expect(mockUserController.checkDuplicates).toHaveBeenCalled();
    expect(mockUserController.createUser).not.toHaveBeenCalled();
  });
});

describe("User Actions - Role setup Story 3", () => {
  let validFormData: FormData;

  const adminSession = {
    user: {
      id: "1",
      name: "Admin User",
      role: "ADMIN",
    },
    expires: "2024-12-31T23:59:59.999Z",
  };

  const citizenSession = {
    user: {
      id: "2",
      name: "Citizen User",
      role: "CITIZEN",
    },
    expires: "2024-12-31T23:59:59.999Z",
  };

  beforeEach(() => {
    validFormData = new FormData();
    validFormData.append("firstName", "Test");
    validFormData.append("lastName", "User");
    validFormData.append("email", "");
    validFormData.append("username", "testuser");
    validFormData.append("password", "Test@1234");
    validFormData.append("role", "OFFICER");
    validFormData.append("office", "DEPARTMENT_OF_COMMERCE");
    validFormData.append("telegram", "");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should register a new OFFICER user successfully", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(adminSession);
    mockUserController.checkDuplicates.mockResolvedValue({ isExisting: false });
    mockUserController.createUser.mockResolvedValue({
      success: true,
      data: "testuser",
    });
    const response: RegistrationResponse = await register(validFormData);
    console.log("Response from register action:", response);
    expect(response.success).toBe(true);
    expect(mockUserController.checkDuplicates).toHaveBeenCalled();
    expect(mockUserController.createUser).toHaveBeenCalled();
  });
  it("should block invalid input data", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(adminSession);
    validFormData.set("office", "");
    const response: RegistrationResponse = await register(validFormData);
    expect(response.success).toBe(false);
    expect(response).toHaveProperty("error");
    expect(mockUserController.checkDuplicates).not.toHaveBeenCalled();
    expect(mockUserController.createUser).not.toHaveBeenCalled();
  });
  it("should block duplicate usernames", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(adminSession);
    mockUserController.checkDuplicates.mockResolvedValue({ isExisting: true });
    const response: RegistrationResponse = await register(validFormData);
    expect(response.success).toBe(false);
    expect(response).toHaveProperty("error");
    expect(mockUserController.checkDuplicates).toHaveBeenCalled();
    expect(mockUserController.createUser).not.toHaveBeenCalled();
  });
  it("should prevent non-admin users from registering OFFICER users", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(citizenSession);
    const response: RegistrationResponse = await register(validFormData);
    expect(response.success).toBe(false);
    expect(response).toHaveProperty("error");
    expect(mockUserController.checkDuplicates).not.toHaveBeenCalled();
    expect(mockUserController.createUser).not.toHaveBeenCalled();
  });
  it("should validate office is from allowed list", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(adminSession);
    validFormData.set("office", "INVALID_OFFICE");
    const response: RegistrationResponse = await register(validFormData);
    expect(response.success).toBe(false);
    expect(response).toHaveProperty("error");
  });
});
