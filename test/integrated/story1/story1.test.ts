import { register } from "@/app/lib/controllers/user.controller";
import { RegistrationResponse } from "@/app/lib/dtos/user.dto";
import { prisma } from "../../setup";

// Mock NextAuth to control sessions
jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(),
}));

jest.mock('@/auth', () => ({
    authOptions: {}
}));

import { getServerSession } from 'next-auth/next';

describe('Story 1 - Integration Test: Citizen Registration', () => {
    
    beforeEach(async () => {
        // Clean database before each test
        await prisma.user.deleteMany({});
    });

    describe('Citizen Registration Flow', () => {
        it('should successfully register a new CITIZEN through the complete flow', async () => {
            // Simulate non-logged user
            (getServerSession as jest.Mock).mockResolvedValue(null);

            // Create valid FormData for CITIZEN
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

            // Execute registration (complete flow)
            const response: RegistrationResponse = await register(formData);

            // Verify response
            expect(response.success).toBe(true);
            if (response.success) {
                expect(response.data).toBe("mariorossi");
            }

            // Verify user was actually saved to database
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
                office: null,
                telegram: "@mariorossi"
            });

            // Verify password was hashed (not plain text)
            expect(savedUser!.passwordHash).not.toBe("SecurePass123!");
            expect(savedUser!.passwordHash).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt pattern
        });

        it('should successfully register CITIZEN without telegram', async () => {
            // Simulate non-logged user
            (getServerSession as jest.Mock).mockResolvedValue(null);

            // Create valid FormData for CITIZEN without telegram
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

            // Execute registration
            const response: RegistrationResponse = await register(formData);

            // Verify response
            expect(response.success).toBe(true);
            if (response.success) {
                expect(response.data).toBe("annabianchi");
            }

            // Verify user was saved correctly without telegram
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
                office: null,
                telegram: null
            });
        });

        it('should prevent registration of duplicate username', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(null);

            // Create first user in database
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

            // Try to register user with same username
            const formData = new FormData();
            formData.append("firstName", "New");
            formData.append("lastName", "User");
            formData.append("email", "newuser@example.com");
            formData.append("username", "existinguser"); // Duplicate username
            formData.append("password", "SecurePass123!");
            formData.append("confirmPassword", "SecurePass123!");
            formData.append("role", "CITIZEN");
            formData.append("office", "");
            formData.append("telegram", "");

            const response: RegistrationResponse = await register(formData);

            // Verify registration failed
            expect(response.success).toBe(false);
            if (!response.success) {
                expect(response.error).toBe("Username and/or email already used");
            }

            // Verify no second user was created
            const usersCount = await prisma.user.count({
                where: { username: "existinguser" }
            });
            expect(usersCount).toBe(1);
        });

        it('should prevent registration with invalid input data', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(null);

            // FormData with invalid data
            const formData = new FormData();
            formData.append("firstName", ""); // Empty
            formData.append("lastName", "User");
            formData.append("email", "invalid-email"); // Invalid email
            formData.append("username", "ab"); // Too short
            formData.append("password", "123"); // Too short
            formData.append("role", "CITIZEN");
            formData.append("office", "");
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

        it('should prevent CITIZEN registration without email', async () => {
            (getServerSession as jest.Mock).mockResolvedValue(null);

            // CITIZEN without email (must fail)
            const formData = new FormData();
            formData.append("firstName", "Test");
            formData.append("lastName", "User");
            formData.append("email", ""); // CITIZEN must have email
            formData.append("username", "testuser");
            formData.append("password", "SecurePass123!");
            formData.append("role", "CITIZEN");
            formData.append("office", "");
            formData.append("telegram", "");

            const response = await register(formData);

            expect(response.success).toBe(false);
            if (!response.success) {
                expect(response.error).toBe("Invalid input data");
            }

            // Verify no user was created
            const usersCount = await prisma.user.count();
            expect(usersCount).toBe(0);
        });

        it('should prevent logged users from registering CITIZEN', async () => {
            // Create existing user in database
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

            // Simulate logged user session
            const userSession = {
                user: {
                    id: existingUser.id.toString(),
                    name: 'Logged User',
                    role: 'CITIZEN'
                },
                expires: '2024-12-31T23:59:59.999Z'
            };
            (getServerSession as jest.Mock).mockResolvedValue(userSession);

            // Try to register new CITIZEN while logged in
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

            // Verify registration was blocked
            expect(response.success).toBe(false);
            if (!response.success) {
                expect(response.error).toBe("Unauthorized registration");
            }

            // Verify new user was not created
            const newUserExists = await prisma.user.findUnique({
                where: { username: "newcitizen" }
            });
            expect(newUserExists).toBeNull();

            // Verify only original user exists
            const totalUsers = await prisma.user.count();
            expect(totalUsers).toBe(1);
        });
    });
});