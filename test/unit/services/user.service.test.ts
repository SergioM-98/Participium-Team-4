import { RegistrationInput, RegistrationResponse } from "@/app/lib/dtos/user.dto";
import { UserRepository } from "@/app/lib/repositories/user.repository";
import { UserService } from "@/app/lib/services/user.service";



const mockUserRepository = {
  checkDuplicates: jest.fn(),
  createUser: jest.fn(),
};

jest.mock('@/app/lib/repositories/user.repository', () => {
  return {
    UserRepository: {
      getInstance: jest.fn(),
    },
  };
});

jest.mock('@/app/lib/repository/notifications.repository', () => {
  return {
    NotificationsRepository: {
      getInstance: jest.fn().mockReturnValue({
        updateNotificationsPreferences: jest.fn().mockResolvedValue({ success: true }),
      }),
    },
  };
});

jest.mock("@/db/db", () => ({
  prisma: {
    $transaction: jest.fn().mockImplementation(async (cb) => cb({})),
  },
}));

describe("User Actions - register function Story 1", () => {
  let validData: RegistrationInput;
  let userService: UserService;

  beforeEach(() => {
    (UserRepository.getInstance as jest.Mock).mockReturnValue(mockUserRepository);   
    userService = UserService.getInstance(); 
    validData = {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      username: "testuser",
      password: "Test@1234",
      confirmPassword: "Test@1234",
      role: "CITIZEN",
      office: undefined,
      telegram: undefined,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should register a new CITIZEN user successfully", async () => {
    mockUserRepository.checkDuplicates.mockResolvedValue({ isExisting: false });
    mockUserRepository.createUser.mockResolvedValue({
      success: true,
      data: "testuser",
    });
    const response: RegistrationResponse = await userService.createUser(validData);
    expect(response.success).toBe(true);
    expect(mockUserRepository.checkDuplicates).toHaveBeenCalled();
    expect(mockUserRepository.createUser).toHaveBeenCalled();
  });
  it("should block invalid input data", async () => {
    validData.username = "";
    const response: RegistrationResponse = await userService.createUser(validData);
    expect(response.success).toBe(false);
    expect(response).toHaveProperty("error");
    expect(mockUserRepository.checkDuplicates).not.toHaveBeenCalled();
    expect(mockUserRepository.createUser).not.toHaveBeenCalled();
  });
  it("should block duplicate usernames", async () => {
    mockUserRepository.checkDuplicates.mockResolvedValue({ isExisting: true });
    const response: RegistrationResponse = await userService.createUser(validData);
    expect(response.success).toBe(false);
    expect(response).toHaveProperty("error");
    expect(mockUserRepository.checkDuplicates).toHaveBeenCalled();
    expect(mockUserRepository.createUser).not.toHaveBeenCalled();
  });
});

describe("User Actions - Role setup Story 3", () => {
  let validData: RegistrationInput;
  let userService: UserService;

  beforeEach(() => {
    (UserRepository.getInstance as jest.Mock).mockReturnValue(mockUserRepository);   
    userService = UserService.getInstance(); 
    validData = {
      firstName: "Test",
      lastName: "User",
      email: "",
      username: "testuser",
      password: "Test@1234",
      confirmPassword: "Test@1234",
      role: "OFFICER",
      office: "DEPARTMENT_OF_COMMERCE",
      telegram: undefined,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should register a new OFFICER user successfully", async () => {
    mockUserRepository.checkDuplicates.mockResolvedValue({ isExisting: false });
    mockUserRepository.createUser.mockResolvedValue({
      success: true,
      data: "testuser",
    });
    const response: RegistrationResponse = await userService.createUser(validData);
    console.log("Response from register action:", response);
    expect(response.success).toBe(true);
    expect(mockUserRepository.checkDuplicates).toHaveBeenCalled();
    expect(mockUserRepository.createUser).toHaveBeenCalled();
  });
  it("should block invalid input data", async () => {
    validData.email = "test@test.com"; // OFFICER cannot have email
    const response: RegistrationResponse = await userService.createUser(validData);
    expect(response.success).toBe(false);
    expect(response).toHaveProperty("error");
    expect(mockUserRepository.checkDuplicates).not.toHaveBeenCalled();
    expect(mockUserRepository.createUser).not.toHaveBeenCalled();
  });
  it("should block duplicate usernames", async () => {
    mockUserRepository.checkDuplicates.mockResolvedValue({ isExisting: true });
    const response: RegistrationResponse = await userService.createUser(validData);
    expect(response.success).toBe(false);
    expect(response).toHaveProperty("error");
    expect(mockUserRepository.checkDuplicates).toHaveBeenCalled();
    expect(mockUserRepository.createUser).not.toHaveBeenCalled();
  });
});

describe("User Actions - OFFICER registration by ADMIN Story 2", () => {
  let validData: RegistrationInput;
  let userService: UserService;

  beforeEach(() => {
    (UserRepository.getInstance as jest.Mock).mockReturnValue(mockUserRepository);
    userService = UserService.getInstance();
    validData = {
      firstName: "Test",
      lastName: "Officer",
      email: "",
      username: "testofficer",
      password: "Test@1234",
      confirmPassword: "Test@1234",
      role: "OFFICER",
      office: "DEPARTMENT_OF_COMMERCE",
      telegram: undefined,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register a new OFFICER by ADMIN successfully", async () => {
    mockUserRepository.checkDuplicates.mockResolvedValue({ isExisting: false });
    mockUserRepository.createUser.mockResolvedValue({
      success: true,
      data: "testofficer",
    });
    const response: RegistrationResponse = await userService.createUser(validData);
    console.log("Response from register action:", response);
    expect(response.success).toBe(true);
    expect(mockUserRepository.checkDuplicates).toHaveBeenCalled();
    expect(mockUserRepository.createUser).toHaveBeenCalled();
  });

  it("should reject OFFICER registration when office is empty", async () => {
    validData.office = undefined;
    const response: RegistrationResponse = await userService.createUser(validData);
    expect(response.success).toBe(false);
    expect(response).toHaveProperty("error");
    expect(mockUserRepository.checkDuplicates).not.toHaveBeenCalled();
    expect(mockUserRepository.createUser).not.toHaveBeenCalled();
  });

  it("should reject OFFICER with email (OFFICER cannot have email)", async () => {
    validData.email = "test@example.com";
    const response: RegistrationResponse = await userService.createUser(validData);
    expect(response.success).toBe(false);
    expect(response).toHaveProperty("error");
    expect(mockUserRepository .checkDuplicates).not.toHaveBeenCalled();
    expect(mockUserRepository.createUser).not.toHaveBeenCalled();
  });

  it("should reject OFFICER with telegram (OFFICER cannot have telegram)", async () => {
    validData.telegram = "@testofficer";
    const response: RegistrationResponse = await userService.createUser(validData);
    expect(response.success).toBe(false);
    expect(response).toHaveProperty("error");
    expect(mockUserRepository.checkDuplicates).not.toHaveBeenCalled();
    expect(mockUserRepository.createUser).not.toHaveBeenCalled();
  });

  it("should block duplicate usernames", async () => {
    mockUserRepository.checkDuplicates.mockResolvedValue({ isExisting: true });
    const response: RegistrationResponse = await userService.createUser(validData);
    expect(response.success).toBe(false);
    expect(response).toHaveProperty("error");
    expect(mockUserRepository.checkDuplicates).toHaveBeenCalled();
    expect(mockUserRepository.createUser).not.toHaveBeenCalled();
  });

  it("should handle repository failure", async () => {
    mockUserRepository.checkDuplicates.mockResolvedValue({ isExisting: false });
    mockUserRepository.createUser.mockResolvedValue({
      success: false,
      error: "Database error",
    });
    const response: RegistrationResponse = await userService.createUser(validData);
    expect(response.success).toBe(false);
    expect(mockUserRepository.checkDuplicates).toHaveBeenCalled();
    expect(mockUserRepository.createUser).toHaveBeenCalled();
    if (!response.success) {
      expect(response.error).toBe("Database error");
    }
  });
});
