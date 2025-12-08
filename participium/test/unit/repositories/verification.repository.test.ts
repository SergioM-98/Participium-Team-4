import { VerificationRepository } from "../../../src/app/lib/repositories/verification.repository";
import { prisma } from "@/prisma/db";

jest.mock("@/prisma/db", () => ({
  prisma: {
    verificationToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe("VerificationRepository - Story PT27", () => {
  let verificationRepository: VerificationRepository;

  beforeEach(() => {
    verificationRepository = VerificationRepository.getInstance();
    jest.clearAllMocks();
  });

  describe("createVerificationToken", () => {
    it("should create a verification token successfully", async () => {
      const mockToken = {
        id: "token-123",
        userId: "user-123",
        code: "123456",
        expiresAt: new Date(),
        createdAt: new Date(),
        isUsed: false,
      };

      (prisma.verificationToken.create as jest.Mock).mockResolvedValue(
        mockToken,
      );

      const result = await verificationRepository.createVerificationToken(
        "user-123",
        "123456",
        new Date(),
      );

      expect(result).toEqual(mockToken);
      expect(prisma.verificationToken.create).toHaveBeenCalledWith({
        data: {
          userId: "user-123",
          code: "123456",
          expiresAt: expect.any(Date),
        },
      });
    });
  });

  describe("findUserByEmail", () => {
    it("should find user by email successfully", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        isVerified: false,
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const result =
        await verificationRepository.findUserByEmail("test@example.com");

      expect(result).toEqual(mockUser);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });

    it("should return null if user not found", async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await verificationRepository.findUserByEmail(
        "nonexistent@example.com",
      );

      expect(result).toBeNull();
    });
  });

  describe("findVerificationToken", () => {
    it("should find verification token by userId and code", async () => {
      const mockToken = {
        id: "token-123",
        userId: "user-123",
        code: "123456",
        expiresAt: new Date(),
        createdAt: new Date(),
        isUsed: false,
      };

      (prisma.verificationToken.findFirst as jest.Mock).mockResolvedValue(
        mockToken,
      );

      const result = await verificationRepository.findVerificationToken(
        "user-123",
        "123456",
      );

      expect(result).toEqual(mockToken);
      expect(prisma.verificationToken.findFirst).toHaveBeenCalledWith({
        where: {
          userId: "user-123",
          code: "123456",
          used: false,
        },
      });
    });

    it("should return null if token not found", async () => {
      (prisma.verificationToken.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await verificationRepository.findVerificationToken(
        "user-123",
        "wrong-code",
      );

      expect(result).toBeNull();
    });
  });

  describe("findLatestVerificationToken", () => {
    it("should find latest verification token for user", async () => {
      const mockToken = {
        id: "token-123",
        userId: "user-123",
        code: "123456",
        expiresAt: new Date(),
        createdAt: new Date(),
        isUsed: false,
      };

      (prisma.verificationToken.findFirst as jest.Mock).mockResolvedValue(
        mockToken,
      );

      const result =
        await verificationRepository.findLatestVerificationToken("user-123");

      expect(result).toEqual(mockToken);
      expect(prisma.verificationToken.findFirst).toHaveBeenCalledWith({
        where: { userId: "user-123", used: false },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should return null if no token found for user", async () => {
      (prisma.verificationToken.findFirst as jest.Mock).mockResolvedValue(null);

      const result =
        await verificationRepository.findLatestVerificationToken("user-123");

      expect(result).toBeNull();
    });

    it("should return null if user has no unused tokens", async () => {
      (prisma.verificationToken.findFirst as jest.Mock).mockResolvedValue(null);

      const result =
        await verificationRepository.findLatestVerificationToken("user-456");

      expect(result).toBeNull();
      expect(prisma.verificationToken.findFirst).toHaveBeenCalledWith({
        where: { userId: "user-456", used: false },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("verifyUserAndMarkToken", () => {
    it("should verify user and mark token as used in transaction", async () => {
      (prisma.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
          const mockPrisma = {
            user: {
              update: jest
                .fn()
                .mockResolvedValue({ id: "user-123", isVerified: true }),
            },
            verificationToken: {
              update: jest
                .fn()
                .mockResolvedValue({ id: "token-123", used: true }),
            },
          };
          return callback(mockPrisma);
        },
      );

      await verificationRepository.verifyUserAndMarkToken(
        "user-123",
        "token-123",
      );

      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe("findExpiredTokenUsers", () => {
    it("should find all expired tokens with unverified users", async () => {
      const mockExpiredTokens = [
        {
          userId: "user-1",
          id: "token-1",
          expiresAt: new Date(Date.now() - 60 * 60 * 1000),
        },
        {
          userId: "user-2",
          id: "token-2",
          expiresAt: new Date(Date.now() - 90 * 60 * 1000),
        },
      ];

      (prisma.verificationToken.findMany as jest.Mock).mockResolvedValue(
        mockExpiredTokens,
      );

      const result = await verificationRepository.findExpiredTokenUsers();

      expect(result).toEqual(mockExpiredTokens);
      expect(prisma.verificationToken.findMany).toHaveBeenCalledWith({
        where: {
          expiresAt: { lt: expect.any(Date) },
          used: false,
        },
        select: {
          userId: true,
        },
        distinct: ["userId"],
      });
    });

    it("should return empty array if no expired tokens found", async () => {
      (prisma.verificationToken.findMany as jest.Mock).mockResolvedValue([]);

      const result = await verificationRepository.findExpiredTokenUsers();

      expect(result).toEqual([]);
      expect(prisma.verificationToken.findMany).toHaveBeenCalled();
    });

    it("should only return distinct userIds", async () => {
      const mockExpiredTokens = [
        { userId: "user-1", id: "token-1" },
        { userId: "user-1", id: "token-2" },
      ];

      (prisma.verificationToken.findMany as jest.Mock).mockResolvedValue(
        mockExpiredTokens,
      );

      const result = await verificationRepository.findExpiredTokenUsers();

      expect(result).toHaveLength(2);
      expect(prisma.verificationToken.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          distinct: ["userId"],
        }),
      );
    });
  });

  describe("deleteUnverifiedUsers", () => {
    it("should delete unverified users", async () => {
      const userIds = ["user-1", "user-2"];

      (prisma.user.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });

      const result =
        await verificationRepository.deleteUnverifiedUsers(userIds);

      expect(result).toEqual({ count: 2 });
      expect(prisma.user.deleteMany).toHaveBeenCalledWith({
        where: {
          id: { in: userIds },
          isVerified: false,
        },
      });
    });

    it("should handle empty user list", async () => {
      (prisma.user.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      const result = await verificationRepository.deleteUnverifiedUsers([]);

      expect(result).toEqual({ count: 0 });
      expect(prisma.user.deleteMany).toHaveBeenCalledWith({
        where: {
          id: { in: [] },
          isVerified: false,
        },
      });
    });

    it("should handle case where no users match deletion criteria", async () => {
      const userIds = ["user-1", "user-2"];

      (prisma.user.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      const result =
        await verificationRepository.deleteUnverifiedUsers(userIds);

      expect(result).toEqual({ count: 0 });
    });
  });

  describe("verifyUserAndMarkToken - Transaction Scenarios", () => {
    it("should verify user and mark token as used in transaction", async () => {
      const mockTransactionTx = {
        user: {
          update: jest
            .fn()
            .mockResolvedValue({ id: "user-123", isVerified: true }),
        },
        verificationToken: {
          update: jest.fn().mockResolvedValue({ id: "token-123", used: true }),
        },
      };

      (prisma.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
          return callback(mockTransactionTx);
        },
      );

      await verificationRepository.verifyUserAndMarkToken(
        "user-123",
        "token-123",
      );

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(mockTransactionTx.verificationToken.update).toHaveBeenCalledWith({
        where: { id: "token-123" },
        data: { used: true },
      });
      expect(mockTransactionTx.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: { isVerified: true },
      });
    });

    it("should handle transaction errors", async () => {
      (prisma.$transaction as jest.Mock).mockRejectedValue(
        new Error("Transaction failed"),
      );

      await expect(
        verificationRepository.verifyUserAndMarkToken("user-123", "token-123"),
      ).rejects.toThrow("Transaction failed");
    });
  });
});
