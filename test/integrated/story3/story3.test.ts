import { register } from "@/app/lib/controllers/user.controller";
import { RegistrationResponse } from "@/app/lib/dtos/user.dto";
import { prisma } from "../../setup";

// Mock NextAuth to control sessions
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
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
    // Clean database before each test
    await prisma.user.deleteMany({});
  });

  describe("Officer Registration Flow", () => {
    it("should successfully register a new OFFICER through the complete flow", async () => {
      // Simulate admin user
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);

      // Create valid FormData for OFFICER
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

      // Execute registration (complete flow)
      const response: RegistrationResponse = await register(formData);

      // Verify response
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data).toBe("mariorossi");
      }

      // Verify user was actually saved to database
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

      // Verify password was hashed (not plain text)
      expect(savedUser!.passwordHash).not.toBe("SecurePass123!");
      expect(savedUser!.passwordHash).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt pattern
    });

    it("should prevent registration of duplicate username", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);

      // Create first user in database
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

      // Try to register user with same username
      const formData = new FormData();
      formData.append("firstName", "New");
      formData.append("lastName", "User");
      formData.append("email", "");
      formData.append("username", "existinguser"); // Duplicate username
      formData.append("password", "SecurePass123!");
      formData.append("confirmPassword", "SecurePass123!");
      formData.append("role", "PUBLIC_RELATIONS_OFFICER");
      formData.append("office", "DEPARTMENT_OF_COMMERCE");
      formData.append("telegram", "");

      const response: RegistrationResponse = await register(formData);

      // Verify registration failed
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Username and/or email already used");
      }

      // Verify no second user was created
      const usersCount = await prisma.user.count({
        where: { username: "existinguser" },
      });
      expect(usersCount).toBe(1);
    });

    it("should prevent registration with invalid input data", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);

      // FormData with invalid data
      const formData = new FormData();
      formData.append("firstName", ""); // Empty
      formData.append("lastName", "User");
      formData.append("email", ""); // Invalid email
      formData.append("username", "ab"); // Too short
      formData.append("password", "123"); // Too short
      formData.append("role", "PUBLIC_RELATIONS_OFFICER");
      formData.append("office", "INVALID_OFFICE");
      formData.append("telegram", "");

      const response: RegistrationResponse = await register(formData);

      // Verify validation failed
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Invalid input data");
      }

      // Verify no user was created
      const usersCount = await prisma.user.count();
      expect(usersCount).toBe(0);
    });

    it("should reject OFFICER registration when office is empty", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);

      // FormData with empty office
      const formData = new FormData();
      formData.append("firstName", "Test");
      formData.append("lastName", "User");
      formData.append("email", "");
      formData.append("username", "testuser");
      formData.append("password", "SecurePass123!");
      formData.append("role", "PUBLIC_RELATIONS_OFFICER");
      formData.append("office", ""); // Empty office
      formData.append("telegram", "");

      const response: RegistrationResponse = await register(formData);

      // Verify registration failed
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Invalid input data");
      }

      // Verify no user was created
      const usersCount = await prisma.user.count();
      expect(usersCount).toBe(0);
    });

    it("should reject OFFICER registration when done by CITIZEN user", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(citizenSession);

      // Create valid FormData for OFFICER
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

      // Verify registration failed
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Unauthorized registration");
      }

      // Verify no user was created
      const usersCount = await prisma.user.count();
      expect(usersCount).toBe(0);
    });
  });
});
