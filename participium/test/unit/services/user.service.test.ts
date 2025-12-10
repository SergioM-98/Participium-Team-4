import { RegistrationInput, RegistrationResponse } from "../../../src/app/lib/dtos/user.dto";
import { UserRepository } from "../../../src/app/lib/repositories/user.repository";
import { UserService } from "../../../src/app/lib/services/user.service";



const mockUserRepository = {
  createUser: jest.fn(),
  getAllOfficers: jest.fn(),
  deleteOfficer: jest.fn(),
  updateOfficerOffices: jest.fn(),
  getOfficer: jest.fn(),
};

jest.mock('@/app/lib/repositories/user.repository', () => {
  return {
    UserRepository: {
      getInstance: jest.fn(),
    },
  };
});

jest.mock('@/app/lib/repositories/notifications.repository', () => {
  return {
    NotificationsRepository: {
      getInstance: jest.fn().mockReturnValue({
        updateNotificationsPreferences: jest.fn().mockResolvedValue({ success: true }),
      }),
    },
  };
});

jest.mock('@/app/lib/services/verification.service', () => {
  return {
    VerificationService: {
      getInstance: jest.fn().mockReturnValue({
        createAndSendVerificationToken: jest.fn().mockResolvedValue({ success: true }),
      }),
    },
  };
});

jest.mock('@/app/lib/services/reportAssignment.service', () => {
  return {
    ReportAssignmentService: {
      getInstance: jest.fn().mockReturnValue({
        unassignReportsOfDeletedOfficer: jest.fn().mockResolvedValue(true),
      }),
    },
  };
});

jest.mock("@/db/db", () => ({
  prisma: {
    $transaction: jest.fn().mockImplementation(async (cb) => cb({})),
  },
}));

describe("User service - register function Story 1", () => {
  let validData: RegistrationInput;
  let userService: UserService;

  beforeEach(() => {
    (UserRepository.getInstance as jest.Mock).mockReturnValue(mockUserRepository);   
    userService = UserService.getInstance(); 
    validData = {
      id: "1",
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      username: "testuser",
      password: "Test@1234",
      confirmPassword: "Test@1234",
      role: ["CITIZEN"],
      office: undefined,
      telegram: undefined,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should register a new CITIZEN user successfully", async () => {
    mockUserRepository.createUser.mockResolvedValue({
      success: true,
      data: "testuser",
    });
    const response: RegistrationResponse = await userService.createUser(validData);
    expect(response.success).toBe(true);
    expect(mockUserRepository.createUser).toHaveBeenCalled();
  });
});

describe("User service - Role setup Story 3", () => {
  let validData: RegistrationInput;
  let userService: UserService;

  beforeEach(() => {
    (UserRepository.getInstance as jest.Mock).mockReturnValue(mockUserRepository);   
    userService = UserService.getInstance(); 
    validData = {
      id: "1",
      firstName: "Test",
      lastName: "User",
      email: "",
      username: "testuser",
      password: "Test@1234",
      confirmPassword: "Test@1234",
      role: ["PUBLIC_RELATIONS_OFFICER"],
      office: "DEPARTMENT_OF_COMMERCE",
      telegram: undefined,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should register a new OFFICER user successfully", async () => {
    mockUserRepository.createUser.mockResolvedValue({
      success: true,
      data: "testuser",
    });
    const response: RegistrationResponse = await userService.createUser(validData);
    console.log("Response from register action:", response);
    expect(response.success).toBe(true);
    expect(mockUserRepository.createUser).toHaveBeenCalled();
  });
});

describe("User service - OFFICER registration by ADMIN Story 2", () => {
  let validData: RegistrationInput;
  let userService: UserService;

  beforeEach(() => {
    (UserRepository.getInstance as jest.Mock).mockReturnValue(mockUserRepository);
    userService = UserService.getInstance();
    validData = {
      id: "1",
      firstName: "Test",
      lastName: "Officer",
      email: "",
      username: "testofficer",
      password: "Test@1234",
      confirmPassword: "Test@1234",
      role: ["PUBLIC_RELATIONS_OFFICER"],
      office: "DEPARTMENT_OF_COMMERCE",
      telegram: undefined,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register a new OFFICER by ADMIN successfully", async () => {
    mockUserRepository.createUser.mockResolvedValue({
      success: true,
      data: "testofficer",
    });
    const response: RegistrationResponse = await userService.createUser(validData);
    console.log("Response from register action:", response);
    expect(response.success).toBe(true);
    expect(mockUserRepository.createUser).toHaveBeenCalled();
  });

  it("should handle repository failure", async () => {
    mockUserRepository.createUser.mockResolvedValue({
      success: false,
      error: "Database error",
    });
    const response: RegistrationResponse = await userService.createUser(validData);
    expect(response.success).toBe(false);
    expect(mockUserRepository.createUser).toHaveBeenCalled();
    if (!response.success) {
      expect(response.error).toBe("Database error");
    }
  });
});

describe("UserService Story 10 - Officer Management", () => {
  let userService: UserService;

  beforeEach(() => {
    (UserRepository.getInstance as jest.Mock).mockReturnValue(mockUserRepository);
    userService = UserService.getInstance();
    jest.clearAllMocks();
  });

  describe("getAllOfficers", () => {
    it("should successfully retrieve all officers", async () => {
      const mockOfficers = [
        {
          id: "officer-1",
          username: "officer1",
          firstName: "John",
          lastName: "Doe",
          role: ["TECHNICAL_OFFICER"],
          office: ["DEPARTMENT_OF_COMMERCE"],
        },
      ];

      mockUserRepository.getAllOfficers.mockResolvedValue({
        success: true,
        data: mockOfficers,
      });

      const response = await userService.getAllOfficers();

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toEqual(mockOfficers);
      }
      expect(mockUserRepository.getAllOfficers).toHaveBeenCalledTimes(1);
    });

    it("should handle repository errors", async () => {
      mockUserRepository.getAllOfficers.mockResolvedValue({
        success: false,
        error: "Database error",
      });

      const response = await userService.getAllOfficers();

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Database error");
      }
    });
  });

  describe("deleteOfficer", () => {
    const officerId = "officer-123";
    const mockOfficer = {
      id: officerId,
      username: "officer1",
      role: ["TECHNICAL_OFFICER"],
      managedReports: [],
    };

    it("should successfully delete an officer", async () => {
      mockUserRepository.getOfficer.mockResolvedValue(mockOfficer);
      mockUserRepository.deleteOfficer.mockResolvedValue(true);

      const result = await userService.deleteOfficer(officerId);

      expect(result).toBe(true);
      expect(mockUserRepository.getOfficer).toHaveBeenCalledWith(officerId);
      expect(mockUserRepository.deleteOfficer).toHaveBeenCalledWith(officerId);
    });

    it("should throw error when officer not found", async () => {
      mockUserRepository.getOfficer.mockResolvedValue(null);

      await expect(userService.deleteOfficer(officerId)).rejects.toThrow(
        `Officer with ID ${officerId} not found`
      );

      expect(mockUserRepository.deleteOfficer).not.toHaveBeenCalled();
    });

    it("should throw error when user is not a TECHNICAL_OFFICER", async () => {
      const nonOfficer = { ...mockOfficer, role: ["CITIZEN"] };
      mockUserRepository.getOfficer.mockResolvedValue(nonOfficer);

      await expect(userService.deleteOfficer(officerId)).rejects.toThrow(
        `Officer with ID ${officerId} not found`
      );

      expect(mockUserRepository.deleteOfficer).not.toHaveBeenCalled();
    });

    it("should return false when unassign reports fails", async () => {
      const { ReportAssignmentService } = require('@/app/lib/services/reportAssignment.service');
      const mockReportService = ReportAssignmentService.getInstance();
      
      mockUserRepository.getOfficer.mockResolvedValue(mockOfficer);
      mockReportService.unassignReportsOfDeletedOfficer.mockResolvedValue(false);

      const result = await userService.deleteOfficer(officerId);

      expect(result).toBe(false);
      expect(mockUserRepository.deleteOfficer).not.toHaveBeenCalled();
    });
  });

  describe("updateOfficerOffices", () => {
    const officerId = "officer-123";
    const offices = ["DEPARTMENT_OF_COMMERCE"];
    const mockOfficer = {
      id: officerId,
      username: "officer1",
      role: ["TECHNICAL_OFFICER"],
    };

    it("should successfully update officer offices", async () => {
      mockUserRepository.getOfficer.mockResolvedValue(mockOfficer);
      mockUserRepository.updateOfficerOffices.mockResolvedValue(true);

      const result = await userService.updateOfficerOffices(officerId, offices);

      expect(result).toBe(true);
      expect(mockUserRepository.getOfficer).toHaveBeenCalledWith(officerId);
      expect(mockUserRepository.updateOfficerOffices).toHaveBeenCalledWith(
        officerId,
        offices
      );
    });

    it("should throw error when officer not found", async () => {
      mockUserRepository.getOfficer.mockResolvedValue(null);

      await expect(
        userService.updateOfficerOffices(officerId, offices)
      ).rejects.toThrow(`Officer with ID ${officerId} not found`);

      expect(mockUserRepository.updateOfficerOffices).not.toHaveBeenCalled();
    });

    it("should throw error when user is not a TECHNICAL_OFFICER", async () => {
      const nonOfficer = { ...mockOfficer, role: ["CITIZEN"] };
      mockUserRepository.getOfficer.mockResolvedValue(nonOfficer);

      await expect(
        userService.updateOfficerOffices(officerId, offices)
      ).rejects.toThrow(`Officer with ID ${officerId} not found`);

      expect(mockUserRepository.updateOfficerOffices).not.toHaveBeenCalled();
    });

    it("should handle empty offices array", async () => {
      mockUserRepository.getOfficer.mockResolvedValue(mockOfficer);
      mockUserRepository.updateOfficerOffices.mockResolvedValue(true);

      const result = await userService.updateOfficerOffices(officerId, []);

      expect(result).toBe(true);
      expect(mockUserRepository.updateOfficerOffices).toHaveBeenCalledWith(
        officerId,
        []
      );
    });
  });
});
