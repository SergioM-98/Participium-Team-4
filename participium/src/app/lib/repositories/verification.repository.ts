import { prisma } from "@/prisma/db";

class VerificationRepository {
  private static instance: VerificationRepository;

  private constructor() {}

  public static getInstance(): VerificationRepository {
    if (!VerificationRepository.instance) {
      VerificationRepository.instance = new VerificationRepository();
    }
    return VerificationRepository.instance;
  }

  public async createVerificationToken(
    userId: string,
    code: string,
    expiresAt: Date,
  ) {
    return await prisma.verificationToken.create({
      data: {
        userId,
        code,
        expiresAt,
      },
    });
  }

  public async findUserByEmail(email: string) {
    return await prisma.user.findFirst({
      where: { email },
    });
  }

  public async findVerificationToken(userId: string, code: string) {
    return await prisma.verificationToken.findFirst({
      where: {
        userId,
        code,
        used: false,
      },
    });
  }

  public async findLatestVerificationToken(userId: string) {
    return await prisma.verificationToken.findFirst({
      where: {
        userId,
        used: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  public async verifyUserAndMarkToken(userId: string, tokenId: string) {
    return await prisma.$transaction(async (tx) => {
      await tx.verificationToken.update({
        where: { id: tokenId },
        data: { used: true },
      });

      await tx.user.update({
        where: { id: userId },
        data: { isVerified: true },
      });
    });
  }

  public async findExpiredTokenUsers() {
    const now = new Date();
    return await prisma.verificationToken.findMany({
      where: {
        expiresAt: { lt: now },
        used: false,
      },
      select: { userId: true },
      distinct: ["userId"],
    });
  }

  public async deleteUnverifiedUsers(userIds: string[]) {
    return await prisma.user.deleteMany({
      where: {
        id: { in: userIds },
        isVerified: false,
      },
    });
  }
}

export { VerificationRepository };
