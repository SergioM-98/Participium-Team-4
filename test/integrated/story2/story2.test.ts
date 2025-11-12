import { register } from "@/app/lib/actions/user";
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
      role: "OFFICER",
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
    // Clean database before each test
    await prisma.user.deleteMany({});
  });

  describe("Officer Registration by Admin Flow", () => {
    it("should successfully register a new OFFICER by ADMIN through the complete flow", async () => {
      // Simulate admin user
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);

      // Create valid FormData for OFFICER
      const formData = new FormData();
      formData.append("firstName", "Mario");
      formData.append("lastName", "Rossi");
      formData.append("email", "");
      formData.append("username", "mariorossi");
      formData.append("password", "SecurePass123!");
      formData.append("role", "OFFICER");
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
        role: "OFFICER",
        office: "DEPARTMENT_OF_COMMERCE",
        telegram: null,
      });

      // Verify password was hashed (not plain text)
      expect(savedUser!.passwordHash).not.toBe("SecurePass123!");
      expect(savedUser!.passwordHash).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt pattern
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
        formData.append("role", "OFFICER");
        formData.append("office", office);
        formData.append("telegram", "");

        const response: RegistrationResponse = await register(formData);

        expect(response.success).toBe(true);

        // Verify user was saved with correct office
        const savedUser = await prisma.user.findUnique({
          where: { username: `officer${office.toLowerCase()}` },
        });

        expect(savedUser).not.toBeNull();
        expect(savedUser!.office).toBe(office);
      }
    });

    it("should prevent registration of duplicate username", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);

      // Create first officer in database
      await prisma.user.create({
        data: {
          firstName: "Existing",
          lastName: "Officer",
          username: "existingofficer",
          passwordHash: "hashedpassword",
          role: "OFFICER",
          office: "DEPARTMENT_OF_COMMERCE",
        },
      });

      // Try to register officer with same username
      const formData = new FormData();
      formData.append("firstName", "New");
      formData.append("lastName", "Officer");
      formData.append("email", "");
      formData.append("username", "existingofficer"); // Duplicate username
      formData.append("password", "SecurePass123!");
      formData.append("role", "OFFICER");
      formData.append("office", "DEPARTMENT_OF_COMMERCE");
      formData.append("telegram", "");

      const response: RegistrationResponse = await register(formData);

      // Verify registration failed
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Username exists");
      }

      // Verify no second user was created
      const usersCount = await prisma.user.count({
        where: { username: "existingofficer" },
      });
      expect(usersCount).toBe(1);
    });

    it("should prevent registration with invalid input data", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);

      // FormData with invalid data
      const formData = new FormData();
      formData.append("firstName", ""); // Empty
      formData.append("lastName", "Officer");
      formData.append("email", "");
      formData.append("username", "ab"); // Too short
      formData.append("password", "123"); // Too short
      formData.append("role", "OFFICER");
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
      formData.append("lastName", "Officer");
      formData.append("email", "");
      formData.append("username", "testofficer");
      formData.append("password", "SecurePass123!");
      formData.append("role", "OFFICER");
      formData.append("office", ""); // Empty office (OFFICER must have office)
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

    it("should reject OFFICER registration when done by OFFICER user", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(officerSession);

      // Create valid FormData for OFFICER
      const formData = new FormData();
      formData.append("firstName", "Test");
      formData.append("lastName", "Officer");
      formData.append("email", "");
      formData.append("username", "testofficer");
      formData.append("password", "SecurePass123!");
      formData.append("role", "OFFICER");
      formData.append("office", "DEPARTMENT_OF_COMMERCE");
      formData.append("telegram", "");

      const response: RegistrationResponse = await register(formData);

      // Verify registration failed (only ADMIN can register OFFICER)
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Unauthorized registration");
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
      formData.append("lastName", "Officer");
      formData.append("email", "");
      formData.append("username", "testofficer");
      formData.append("password", "SecurePass123!");
      formData.append("role", "OFFICER");
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

    it("should reject OFFICER registration without session (not logged in)", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      // Create valid FormData for OFFICER
      const formData = new FormData();
      formData.append("firstName", "Test");
      formData.append("lastName", "Officer");
      formData.append("email", "");
      formData.append("username", "testofficer");
      formData.append("password", "SecurePass123!");
      formData.append("role", "OFFICER");
      formData.append("office", "DEPARTMENT_OF_COMMERCE");
      formData.append("telegram", "");

      const response: RegistrationResponse = await register(formData);

      // Verify registration failed (must be logged in as ADMIN)
      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error).toBe("Unauthorized registration");
      }

      // Verify no user was created
      const usersCount = await prisma.user.count();
      expect(usersCount).toBe(0);
    });

    it("should reject OFFICER registration with email (OFFICER cannot have email)", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);

      // FormData with email (OFFICER should not have email)
      const formData = new FormData();
      formData.append("firstName", "Test");
      formData.append("lastName", "Officer");
      formData.append("email", "test.officer@example.com"); // OFFICER cannot have email
      formData.append("username", "testofficer");
      formData.append("password", "SecurePass123!");
      formData.append("role", "OFFICER");
      formData.append("office", "DEPARTMENT_OF_COMMERCE");
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

    it("should reject OFFICER registration with telegram (OFFICER cannot have telegram)", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);

      // FormData with telegram (OFFICER should not have telegram)
      const formData = new FormData();
      formData.append("firstName", "Test");
      formData.append("lastName", "Officer");
      formData.append("email", "");
      formData.append("username", "testofficer");
      formData.append("password", "SecurePass123!");
      formData.append("role", "OFFICER");
      formData.append("office", "DEPARTMENT_OF_COMMERCE");
      formData.append("telegram", "@testofficer"); // OFFICER cannot have telegram

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
  });
});
