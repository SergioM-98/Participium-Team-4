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

describe("Story 3 - Integration Test: Officer Role assignment", () => {
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

  beforeEach(async () => {
    if (prisma.notification) await prisma.notification.deleteMany({});
    await prisma.photo.deleteMany({});
    await prisma.report.deleteMany({});
    if (prisma.profilePhoto) await prisma.profilePhoto.deleteMany({});
    if (prisma.notificationPreferences)
      await prisma.notificationPreferences.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe("Officer Registration Flow", () => {
    it("should successfully register a new OFFICER through the complete flow", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);

      const formData = new FormData();
      formData.append("firstName", "Mario");
      formData.append("lastName", "Rossi");
      formData.append("email", "");
      formData.append("username", "mariorossi");
      formData.append("password", "SecurePass123!");
      formData.append("confirmPassword", "SecurePass123!");
      formData.append("role", "PUBLIC_RELATIONS_OFFICER");
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
        role: "PUBLIC_RELATIONS_OFFICER",
        office: "DEPARTMENT_OF_COMMERCE",
        telegram: null,
      });

      expect(savedUser!.passwordHash).not.toBe("SecurePass123!");
      expect(savedUser!.passwordHash).toMatch(/^\$2[aby]\$\d+\$/);
    });

    it("should prevent registration of duplicate username", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);

      await prisma.user.create({
        data: {
          firstName: "Existing",
          lastName: "User",
          username: "existinguser",
          passwordHash: "hashedpassword",
          role: "PUBLIC_RELATIONS_OFFICER",
          office: "DEPARTMENT_OF_COMMERCE",
        },
      });

      const formData = new FormData();
      formData.append("firstName", "New");
      formData.append("lastName", "User");
      formData.append("email", "");
      formData.append("username", "existinguser");
      formData.append("password", "SecurePass123!");
      formData.append("confirmPassword", "SecurePass123!");
      formData.append("role", "PUBLIC_RELATIONS_OFFICER");
      formData.append("office", "DEPARTMENT_OF_COMMERCE");
      formData.append("telegram", "");

      const response: RegistrationResponse = await register(formData);

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Username and/or email already used");
      }

      const usersCount = await prisma.user.count({
        where: { username: "existinguser" },
      });
      expect(usersCount).toBe(1);
    });

    it("should prevent registration with invalid input data", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);

      const formData = new FormData();
      formData.append("firstName", "");
      formData.append("lastName", "User");
      formData.append("email", "");
      formData.append("username", "ab");
      formData.append("password", "123");
      formData.append("role", "PUBLIC_RELATIONS_OFFICER");
      formData.append("office", "INVALID_OFFICE");
      formData.append("telegram", "");

      const response: RegistrationResponse = await register(formData);

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toContain("First name is required");
        expect(response.error).toContain("office - Invalid option");
      }

      const usersCount = await prisma.user.count();
      expect(usersCount).toBe(0);
    });

    it("should reject OFFICER registration when office is empty", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);

      const formData = new FormData();
      formData.append("firstName", "Test");
      formData.append("lastName", "User");
      formData.append("email", "");
      formData.append("username", "testuser");
      formData.append("password", "SecurePass123!");
      formData.append("confirmPassword", "SecurePass123!"); // Added
      formData.append("role", "PUBLIC_RELATIONS_OFFICER");
      formData.append("office", "");
      formData.append("telegram", "");

      const response: RegistrationResponse = await register(formData);

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toContain(
          "office - Only OFFICER can have an office"
        );
      }

      const usersCount = await prisma.user.count();
      expect(usersCount).toBe(0);
    });

    it("should reject OFFICER registration when done by CITIZEN user", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(citizenSession);

      const formData = new FormData();
      formData.append("firstName", "Test");
      formData.append("lastName", "User");
      formData.append("email", "");
      formData.append("username", "testuser");
      formData.append("password", "SecurePass123!");
      formData.append("confirmPassword", "SecurePass123!");
      formData.append("role", "PUBLIC_RELATIONS_OFFICER");
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
  });
});
