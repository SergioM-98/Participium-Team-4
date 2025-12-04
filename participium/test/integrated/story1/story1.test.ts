import { register } from "../../../src/app/lib/controllers/user.controller";
import { RegistrationResponse } from "../../../src/app/lib/dtos/user.dto";
import { prisma } from "../../setup";

jest.mock('next-auth/next', () => ({
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

jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
    authOptions: {},
}));

jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
    authOptions: {}
}));

import { getServerSession } from 'next-auth/next';

describe('Story 1 - Integration Test: Citizen Registration', () => {
    
    beforeEach(async () => {
        if (prisma.notification) await prisma.notification.deleteMany({});
        await prisma.photo.deleteMany({});
        await prisma.report.deleteMany({});
        if (prisma.profilePhoto) await prisma.profilePhoto.deleteMany({});
        if (prisma.notificationPreferences) await prisma.notificationPreferences.deleteMany({});
        await prisma.user.deleteMany({});
    });

    describe('Citizen Registration Flow', () => {
        it('should successfully register a new CITIZEN through the complete flow', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(null);

            const formData = new FormData();
            formData.append("firstName", "Mario");
            formData.append("lastName", "Rossi");
            formData.append("email", "mario.rossi@example.com");
            formData.append("username", "mariorossi");
            formData.append("password", "SecurePass123!");
            formData.append("confirmPassword", "SecurePass123!");
            formData.append("role", "CITIZEN");
            formData.append("office", "");
            formData.append("telegram", "@mariorossi");

            const response: RegistrationResponse = await register(formData);

            expect(response.success).toBe(true);
            if (response.success) {
                expect(response.data).toBe("mariorossi");
            }

            const savedUser = await prisma.user.findUnique({
                where: { username: "mariorossi" }
            });

            expect(savedUser).not.toBeNull();
            expect(savedUser).toMatchObject({
                firstName: "Mario",
                lastName: "Rossi",
                email: "mario.rossi@example.com",
                username: "mariorossi",
                role: "CITIZEN",
                office: null
            });

            expect(savedUser!.passwordHash).not.toBe("SecurePass123!");
            expect(savedUser!.passwordHash).toMatch(/^\$2[aby]\$\d+\$/); 
        });

        it('should successfully register CITIZEN without telegram', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(null);

            const formData = new FormData();
            formData.append("firstName", "Anna");
            formData.append("lastName", "Bianchi");
            formData.append("email", "anna.bianchi@example.com");
            formData.append("username", "annabianchi");
            formData.append("password", "SecurePass123!");
            formData.append("confirmPassword", "SecurePass123!");
            formData.append("role", "CITIZEN");
            formData.append("office", "");
            formData.append("telegram", "");

            const response: RegistrationResponse = await register(formData);

            expect(response.success).toBe(true);
            if (response.success) {
                expect(response.data).toBe("annabianchi");
            }

            const savedUser = await prisma.user.findUnique({
                where: { username: "annabianchi" }
            });

            expect(savedUser).not.toBeNull();
            expect(savedUser).toMatchObject({
                firstName: "Anna",
                lastName: "Bianchi",
                email: "anna.bianchi@example.com",
                username: "annabianchi",
                role: "CITIZEN",
                office: null
            });
        });

        it('should prevent registration of duplicate username', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(null);

            await prisma.user.create({
                data: {
                    firstName: "Existing",
                    lastName: "User",
                    email: "existing@example.com",
                    username: "existinguser",
                    passwordHash: "hashedpassword",
                    role: "CITIZEN"
                }
            });

            const formData = new FormData();
            formData.append("firstName", "New");
            formData.append("lastName", "User");
            formData.append("email", "newuser@example.com");
            formData.append("username", "existinguser"); 
            formData.append("password", "SecurePass123!");
            formData.append("confirmPassword", "SecurePass123!");
            formData.append("role", "CITIZEN");
            formData.append("office", "");
            formData.append("telegram", "");

            const response: RegistrationResponse = await register(formData);

            expect(response.success).toBe(false);
            if (!response.success) {
                expect(response.error).toBe("Username and/or email already used");
            }

            const usersCount = await prisma.user.count({
                where: { username: "existinguser" }
            });
            expect(usersCount).toBe(1);
        });

        it('should prevent registration with invalid input data', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(null);

            const formData = new FormData();
            formData.append("firstName", ""); 
            formData.append("lastName", "User");
            formData.append("email", "invalid-email"); 
            formData.append("username", "ab"); 
            formData.append("password", "123"); 
            formData.append("role", "CITIZEN");
            formData.append("office", "");
            formData.append("telegram", "");

            const response: RegistrationResponse = await register(formData);

            expect(response.success).toBe(false);
            if (!response.success) {
                expect(response.error).toContain("firstName - First name is required");
                expect(response.error).toContain("username - Username must be at least 3 characters");
            }

            const usersCount = await prisma.user.count();
            expect(usersCount).toBe(0);
        });

        it('should prevent CITIZEN registration without email', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(null);

            const formData = new FormData();
            formData.append("firstName", "Test");
            formData.append("lastName", "User");
            formData.append("email", ""); 
            formData.append("username", "testuser");
            formData.append("password", "SecurePass123!");
            formData.append("confirmPassword", "SecurePass123!"); // Added confirmPassword
            formData.append("role", "CITIZEN");
            formData.append("office", "");
            formData.append("telegram", "");

            const response = await register(formData);

            expect(response.success).toBe(false);
            if (!response.success) {
                expect(response.error).toContain("email");
            }

            const usersCount = await prisma.user.count();
            expect(usersCount).toBe(0);
        });

        it('should prevent logged users from registering CITIZEN', async () => {
            const existingUser = await prisma.user.create({
                data: {
                    firstName: "Logged",
                    lastName: "User",
                    email: "logged@example.com",
                    username: "loggeduser",
                    passwordHash: "hashedpassword",
                    role: "CITIZEN"
                }
            });

            const userSession = {
                user: {
                    id: existingUser.id.toString(),
                    name: 'Logged User',
                    role: 'CITIZEN'
                },
                expires: '2024-12-31T23:59:59.999Z'
            };
            (getServerSession as jest.Mock).mockResolvedValue(userSession);

            const formData = new FormData();
            formData.append("firstName", "New");
            formData.append("lastName", "Citizen");
            formData.append("email", "newcitizen@example.com");
            formData.append("username", "newcitizen");
            formData.append("password", "SecurePass123!");
            formData.append("confirmPassword", "SecurePass123!");
            formData.append("role", "CITIZEN");
            formData.append("office", "");
            formData.append("telegram", "");

            const response: RegistrationResponse = await register(formData);

            expect(response.success).toBe(false);
            if (!response.success) {
                expect(response.error).toBe("Unauthorized registration");
            }

            const newUserExists = await prisma.user.findUnique({
                where: { username: "newcitizen" }
            });
            expect(newUserExists).toBeNull();

            const totalUsers = await prisma.user.count();
            expect(totalUsers).toBe(1);
        });
    });
});