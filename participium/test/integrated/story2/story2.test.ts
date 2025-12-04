import { register } from "../../../src/app/lib/controllers/user.controller";
import { RegistrationResponse } from "../../../src/app/lib/dtos/user.dto";
import { prisma } from "../../setup";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("next-auth", () => ({
    __esModule: true,
    default: jest.fn(() => ({
      handlers: { GET: jest.fn(), POST: jest.fn() },
      auth: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
    })),
}));

jest.mock("@/auth", () => ({
    authOptions: {},
}));

jest.mock("@/auth", () => ({
  authOptions: {},
}));

import { getServerSession } from "next-auth/next";

describe("Story 2 - Integration Test: Officer Registration by Admin", () => {
  const adminSession = {
    user: {
      id: "1",
      name: "Admin User",
      role: "ADMIN",
    },
    expires: "2024-12-31T23:59:59.999Z",
  };

  const officerSession = {
    user: {
      id: "2",
      name: "Officer User",
      role: "TECHNICAL_OFFICER",
    },
    expires: "2024-12-31T23:59:59.999Z",
  };

  const citizenSession = {
    user: {
      id: "3",
      name: "Citizen User",
      role: "CITIZEN",
    },
    expires: "2024-12-31T23:59:59.999Z",
  };

  beforeEach(async () => {
    if (prisma.notification) await prisma.notification.deleteMany({});
    await prisma.photo.deleteMany({});
    await prisma.report.deleteMany({});
    if (prisma.profilePhoto) await prisma.profilePhoto.deleteMany({});
    if (prisma.notificationPreferences) await prisma.notificationPreferences.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe("Officer Registration by Admin Flow", () => {
    it("should successfully register a new OFFICER by ADMIN through the complete flow", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);

      const formData = new FormData();
      formData.append("firstName", "Mario");
      formData.append("lastName", "Rossi");
      formData.append("email", "");
      formData.append("username", "mariorossi");
      formData.append("password", "SecurePass123!");
      formData.append("confirmPassword", "SecurePass123!");
      formData.append("role", "TECHNICAL_OFFICER");
      formData.append("office", "DEPARTMENT_OF_COMMERCE");
      formData.append("telegram", "");

      const response: RegistrationResponse = await register(formData);

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toBe("mariorossi");
      }

      const savedUser = await prisma.user.findUnique({
        where: { username: "mariorossi" },
      });

      expect(savedUser).not.toBeNull();
      expect(savedUser).toMatchObject({
        firstName: "Mario",
        lastName: "Rossi",
        email: null,
        username: "mariorossi",
        role: "TECHNICAL_OFFICER",
        office: "DEPARTMENT_OF_COMMERCE",
        telegram: null,
      });

      expect(savedUser!.passwordHash).not.toBe("SecurePass123!");
      expect(savedUser!.passwordHash).toMatch(/^\$2[aby]\$\d+\$/);
    });

    it("should successfully register OFFICER with different office departments", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);

      const offices = [
        "DEPARTMENT_OF_LOCAL_POLICE",
        "DEPARTMENT_OF_EDUCATIONAL_SERVICES",
        "DEPARTMENT_OF_ENVIRONMENT_MAJOR_PROJECTS_INFRAS_AND_MOBILITY",
        "OTHER",
      ];

      for (const office of offices) {
        const formData = new FormData();
        formData.append("firstName", "Officer");
        formData.append("lastName", office);
        formData.append("email", "");
        formData.append("username", `officer${office.toLowerCase()}`);
        formData.append("password", "SecurePass123!");
        formData.append("confirmPassword", "SecurePass123!");
        formData.append("role", "TECHNICAL_OFFICER");
        formData.append("office", office);
        formData.append("telegram", "");

        const response: RegistrationResponse = await register(formData);

        expect(response.success).toBe(true);

        const savedUser = await prisma.user.findUnique({
          where: { username: `officer${office.toLowerCase()}` },
        });

        expect(savedUser).not.toBeNull();
        expect(savedUser!.office).toBe(office);
      }
    });

    it("should prevent registration of duplicate username", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);

      await prisma.user.create({
        data: {
          firstName: "Existing",
          lastName: "Officer",
          username: "existingofficer",
          passwordHash: "hashedpassword",
          role: "TECHNICAL_OFFICER",
          office: "DEPARTMENT_OF_COMMERCE",
        },
      });

      const formData = new FormData();
      formData.append("firstName", "New");
      formData.append("lastName", "Officer");
      formData.append("email", "");
      formData.append("username", "existingofficer");
      formData.append("password", "SecurePass123!");
      formData.append("confirmPassword", "SecurePass123!");
      formData.append("role", "TECHNICAL_OFFICER");
      formData.append("office", "DEPARTMENT_OF_COMMERCE");
      formData.append("telegram", "");

      const response: RegistrationResponse = await register(formData);

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Username and/or email already used");
      }

      const usersCount = await prisma.user.count({
        where: { username: "existingofficer" },
      });
      expect(usersCount).toBe(1);
    });

    it("should prevent registration with invalid input data", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);

      const formData = new FormData();
      formData.append("firstName", "");
      formData.append("lastName", "Officer");
      formData.append("email", "");
      formData.append("username", "ab");
      formData.append("password", "123");
      formData.append("role", "TECHNICAL_OFFICER");
      formData.append("office", "INVALID_OFFICE");
      formData.append("telegram", "");

      const response: RegistrationResponse = await register(formData);

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toContain("First name is required");
        expect(response.error).toContain("Username must be at least 3 characters");
      }

      const usersCount = await prisma.user.count();
      expect(usersCount).toBe(0);
    });

    it("should reject OFFICER registration when office is empty", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);

      const formData = new FormData();
      formData.append("firstName", "Test");
      formData.append("lastName", "Officer");
      formData.append("email", "");
      formData.append("username", "testofficer");
      formData.append("password", "SecurePass123!");
      formData.append("confirmPassword", "SecurePass123!");
      formData.append("role", "TECHNICAL_OFFICER");
      formData.append("office", "");
      formData.append("telegram", "");

      const response: RegistrationResponse = await register(formData);

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toContain("office - Only OFFICER can have an office");
      }

      const usersCount = await prisma.user.count();
      expect(usersCount).toBe(0);
    });

    it("should reject OFFICER registration when done by OFFICER user", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(officerSession);

      const formData = new FormData();
      formData.append("firstName", "Test");
      formData.append("lastName", "Officer");
      formData.append("email", "");
      formData.append("username", "testofficer");
      formData.append("password", "SecurePass123!");
      formData.append("confirmPassword", "SecurePass123!");
      formData.append("role", "TECHNICAL_OFFICER");
      formData.append("office", "DEPARTMENT_OF_COMMERCE");
      formData.append("telegram", "");

      const response: RegistrationResponse = await register(formData);

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Unauthorized registration");
      }

      const usersCount = await prisma.user.count();
      expect(usersCount).toBe(0);
    });

    it("should reject OFFICER registration when done by CITIZEN user", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(citizenSession);

      const formData = new FormData();
      formData.append("firstName", "Test");
      formData.append("lastName", "Officer");
      formData.append("email", "");
      formData.append("username", "testofficer");
      formData.append("password", "SecurePass123!");
      formData.append("confirmPassword", "SecurePass123!");
      formData.append("role", "TECHNICAL_OFFICER");
      formData.append("office", "DEPARTMENT_OF_COMMERCE");
      formData.append("telegram", "");

      const response: RegistrationResponse = await register(formData);

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Unauthorized registration");
      }

      const usersCount = await prisma.user.count();
      expect(usersCount).toBe(0);
    });

    it("should reject OFFICER registration without session (not logged in)", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const formData = new FormData();
      formData.append("firstName", "Test");
      formData.append("lastName", "Officer");
      formData.append("email", "");
      formData.append("username", "testofficer");
      formData.append("password", "SecurePass123!");
      formData.append("confirmPassword", "SecurePass123!");
      formData.append("role", "TECHNICAL_OFFICER");
      formData.append("office", "DEPARTMENT_OF_COMMERCE");
      formData.append("telegram", "");

      const response: RegistrationResponse = await register(formData);

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Unauthorized registration");
      }

      const usersCount = await prisma.user.count();
      expect(usersCount).toBe(0);
    });

    it("should reject OFFICER registration with email (OFFICER cannot have email)", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);

      const formData = new FormData();
      formData.append("firstName", "Test");
      formData.append("lastName", "Officer");
      formData.append("email", "test.officer@example.com");
      formData.append("username", "testofficer");
      formData.append("password", "SecurePass123!");
      formData.append("confirmPassword", "SecurePass123!");
      formData.append("role", "TECHNICAL_OFFICER");
      formData.append("office", "DEPARTMENT_OF_COMMERCE");
      formData.append("telegram", "");

      const response: RegistrationResponse = await register(formData);

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toContain("email - Only CITIZEN can have an email");
      }

      const usersCount = await prisma.user.count();
      expect(usersCount).toBe(0);
    });

    it("should not save telegram for OFFICER even if provided", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);

      const formData = new FormData();
      formData.append("firstName", "Test");
      formData.append("lastName", "Officer");
      formData.append("email", "");
      formData.append("username", "testofficer");
      formData.append("password", "SecurePass123!");
      formData.append("confirmPassword", "SecurePass123!");
      formData.append("role", "TECHNICAL_OFFICER");
      formData.append("office", "DEPARTMENT_OF_COMMERCE");
      formData.append("telegram", "@testofficer");

      const response: RegistrationResponse = await register(formData);

      expect(response.success).toBe(true);
      
      const savedUser = await prisma.user.findUnique({
        where: { username: "testofficer" },
      });

      expect(savedUser).not.toBeNull();
      expect(savedUser!.telegram).toBeNull();
    });
  });
});