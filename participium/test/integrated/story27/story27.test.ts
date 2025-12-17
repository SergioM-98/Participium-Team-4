import { prisma } from "../../setup";
import crypto from "crypto";
import { verifyRegistration } from "../../../src/app/lib/controllers/verification.controller";
import { UserService } from "../../../src/app/lib/services/user.service";

// Mock the email service at module load time
jest.mock("@/services/email.service", () => {
  return {
    EmailService: class {
      private static instance: any;
      
      private constructor() {}
      
      static getInstance() {
        if (!this.instance) {
          this.instance = new this();
        }
        return this.instance;
      }
      
      async sendVerificationEmail(email: string, code: string, firstName?: string) {
        return undefined;
      }
    }
  };
});

describe("Story 27 - Integration Test: Citizen Email Verification with Code", () => {
  let testCitizenEmail: string;
  let testCitizenUsername: string;

  // Helper function to register a citizen directly
  async function registerCitizen(username: string, email: string) {
    const userData = {
      id: crypto.randomUUID(),
      firstName: "Test",
      lastName: "Citizen",
      email,
      username,
      password: "TestPassword123!",
      confirmPassword: "TestPassword123!",
      role: ["CITIZEN"] as const,
    };

    const userService = UserService.getInstance();
    return await userService.createUser(userData);
  }

  beforeEach(async () => {
    if (prisma.notification) await prisma.notification.deleteMany({});
    await prisma.verificationToken.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.photo.deleteMany({});
    await prisma.report.deleteMany({});
    if (prisma.profilePhoto) await prisma.profilePhoto.deleteMany({});
    if (prisma.notificationPreferences)
      await prisma.notificationPreferences.deleteMany({});
    await prisma.user.deleteMany({});

    testCitizenEmail = `citizen27_${Date.now()}@test.com`;
    testCitizenUsername = `testcitizen27_${Date.now()}`;
  });

  afterAll(async () => {
    if (prisma.notification) await prisma.notification.deleteMany({});
    await prisma.verificationToken.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.photo.deleteMany({});
    await prisma.report.deleteMany({});
    if (prisma.profilePhoto) await prisma.profilePhoto.deleteMany({});
    if (prisma.notificationPreferences)
      await prisma.notificationPreferences.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe("Citizen Registration with Email Verification", () => {
    it("should register a citizen with isVerified=false", async () => {
      const response = await registerCitizen(testCitizenUsername, testCitizenEmail);

      expect(response.success).toBe(true);

      const user = await prisma.user.findUnique({
        where: { username: testCitizenUsername },
      });

      expect(user).not.toBeNull();
      expect(user?.isVerified).toBe(false);
      expect(user?.email).toBe(testCitizenEmail);
      expect(user?.role).toEqual(["CITIZEN"]);
    });

    it("should create a verification token when citizen registers", async () => {
      await registerCitizen(testCitizenUsername, testCitizenEmail);

      const user = await prisma.user.findUnique({
        where: { username: testCitizenUsername },
      });

      const verificationToken = await prisma.verificationToken.findFirst({
        where: { userId: user!.id },
      });

      expect(verificationToken).not.toBeNull();
      expect(verificationToken?.code).toMatch(/^\d{6}$/);
      expect(verificationToken?.used).toBe(false);
      expect(verificationToken?.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it("should generate a 6-digit numeric verification code", async () => {
      await registerCitizen(testCitizenUsername, testCitizenEmail);

      const user = await prisma.user.findUnique({
        where: { username: testCitizenUsername },
      });

      const verificationToken = await prisma.verificationToken.findFirst({
        where: { userId: user!.id },
      });

      expect(verificationToken?.code).toMatch(/^\d{6}$/);
    });

    it("should set verification token expiry to 30 minutes from creation", async () => {
      const beforeCreation = Date.now();

      await registerCitizen(testCitizenUsername, testCitizenEmail);

      const afterCreation = Date.now();

      const user = await prisma.user.findUnique({
        where: { username: testCitizenUsername },
      });

      const verificationToken = await prisma.verificationToken.findFirst({
        where: { userId: user!.id },
      });

      const expectedMinExpiry = beforeCreation + 30 * 60 * 1000;
      const expectedMaxExpiry = afterCreation + 30 * 60 * 1000;
      const tokenExpiry = verificationToken!.expiresAt.getTime();

      expect(tokenExpiry).toBeGreaterThanOrEqual(expectedMinExpiry);
      expect(tokenExpiry).toBeLessThanOrEqual(expectedMaxExpiry + 1000);
    });
  });

  describe("Successful Email Verification", () => {
    it("should verify citizen with correct verification code", async () => {
      await registerCitizen(testCitizenUsername, testCitizenEmail);

      const user = await prisma.user.findUnique({
        where: { username: testCitizenUsername },
      });

      const verificationToken = await prisma.verificationToken.findFirst({
        where: { userId: user!.id },
      });

      const response = await verifyRegistration(
        testCitizenEmail,
        verificationToken!.code
      );

      expect(response.success).toBe(true);

      const verifiedUser = await prisma.user.findUnique({
        where: { id: user!.id },
      });

      expect(verifiedUser?.isVerified).toBe(true);

      const usedToken = await prisma.verificationToken.findUnique({
        where: { id: verificationToken!.id },
      });

      expect(usedToken?.used).toBe(true);
    });

    it("should mark verification token as used after successful verification", async () => {
      await registerCitizen(testCitizenUsername, testCitizenEmail);

      const user = await prisma.user.findUnique({
        where: { username: testCitizenUsername },
      });

      const verificationTokenBefore = await prisma.verificationToken.findFirst({
        where: { userId: user!.id },
      });

      expect(verificationTokenBefore?.used).toBe(false);

      await verifyRegistration(testCitizenEmail, verificationTokenBefore!.code);

      const verificationTokenAfter = await prisma.verificationToken.findUnique({
        where: { id: verificationTokenBefore!.id },
      });

      expect(verificationTokenAfter?.used).toBe(true);
    });
  });

  describe("Verification Errors and Edge Cases", () => {
    it("should fail verification with incorrect code", async () => {
      await registerCitizen(testCitizenUsername, testCitizenEmail);

      const response = await verifyRegistration(testCitizenEmail, "000000");

      expect(response.success).toBe(false);
      expect(response.error).toBe("Invalid verification code");

      const user = await prisma.user.findUnique({
        where: { username: testCitizenUsername },
      });

      expect(user?.isVerified).toBe(false);
    });

    it("should fail verification with non-existent email", async () => {
      const response = await verifyRegistration("nonexistent@test.com", "123456");

      expect(response.success).toBe(false);
      expect(response.error).toBe("User not found");
    });

    it("should prevent verification of already verified user", async () => {
      await registerCitizen(testCitizenUsername, testCitizenEmail);

      const user = await prisma.user.findUnique({
        where: { username: testCitizenUsername },
      });

      const verificationToken = await prisma.verificationToken.findFirst({
        where: { userId: user!.id },
      });

      await verifyRegistration(testCitizenEmail, verificationToken!.code);

      const secondResponse = await verifyRegistration(
        testCitizenEmail,
        verificationToken!.code
      );

      expect(secondResponse.success).toBe(false);
      expect(secondResponse.error).toBe("User is already verified");
    });

    it("should fail verification with expired token", async () => {
      await registerCitizen(testCitizenUsername, testCitizenEmail);

      const user = await prisma.user.findUnique({
        where: { username: testCitizenUsername },
      });

      const verificationToken = await prisma.verificationToken.findFirst({
        where: { userId: user!.id },
      });

      await prisma.verificationToken.update({
        where: { id: verificationToken!.id },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });

      const response = await verifyRegistration(
        testCitizenEmail,
        verificationToken!.code
      );

      expect(response.success).toBe(false);
      expect(response.error).toBe(
        "Verification code has expired. Please register again."
      );
    });

    it("should fail verification with empty code", async () => {
      const response = await verifyRegistration(testCitizenEmail, "");

      expect(response.success).toBe(false);
      expect(response.error).toBe("Verification code is required");
    });

    it("should fail verification with used token", async () => {
      await registerCitizen(testCitizenUsername, testCitizenEmail);

      const user = await prisma.user.findUnique({
        where: { username: testCitizenUsername },
      });

      const verificationToken = await prisma.verificationToken.findFirst({
        where: { userId: user!.id },
      });

      await prisma.verificationToken.update({
        where: { id: verificationToken!.id },
        data: { used: true },
      });

      const response = await verifyRegistration(
        testCitizenEmail,
        verificationToken!.code
      );

      expect(response.success).toBe(false);
      expect(response.error).toBe("Invalid verification code");
    });
  });

  describe("Complete Registration and Verification Workflow", () => {
    it("should complete full workflow: register -> receive code -> verify -> become valid user", async () => {
      // Step 1: Register
      const registrationResponse = await registerCitizen(
        testCitizenUsername,
        testCitizenEmail
      );

      expect(registrationResponse.success).toBe(true);

      // Step 2: User should be unverified
      const unverifiedUser = await prisma.user.findUnique({
        where: { username: testCitizenUsername },
      });

      expect(unverifiedUser?.isVerified).toBe(false);

      // Step 3: Get verification code
      const verificationToken = await prisma.verificationToken.findFirst({
        where: { userId: unverifiedUser!.id },
      });

      expect(verificationToken).not.toBeNull();
      expect(verificationToken?.code).toMatch(/^\d{6}$/);

      // Step 4: Verify with code
      const verificationResponse = await verifyRegistration(
        testCitizenEmail,
        verificationToken!.code
      );

      expect(verificationResponse.success).toBe(true);

      // Step 5: User should now be verified
      const verifiedUser = await prisma.user.findUnique({
        where: { username: testCitizenUsername },
      });

      expect(verifiedUser?.isVerified).toBe(true);

      // Step 6: Token should be marked as used
      const usedToken = await prisma.verificationToken.findUnique({
        where: { id: verificationToken!.id },
      });

      expect(usedToken?.used).toBe(true);

      // Step 7: User should have notification preferences
      const notificationPreferences = await prisma.notificationPreferences.findFirst({
        where: { citizen: { id: unverifiedUser!.id } },
      });

      expect(notificationPreferences).not.toBeNull();
      expect(notificationPreferences?.emailEnabled).toBe(true);
    });
  });
});
