"use server";

import {
  CheckDuplicatesResponse,
  LoginInput,
  LoginResponse,
  RegistrationInput,
  RegistrationResponse,
} from "@/dtos/user.dto";
import { prisma } from "@/prisma/db";
import bcrypt from "bcrypt";
import { Prisma, PrismaClient } from "@prisma/client";

type DBClient = PrismaClient | Prisma.TransactionClient;

class UserRepository {
  private static instance: UserRepository;

  private constructor() {}

  public static getInstance(): UserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }
    return UserRepository.instance;
  }

  async checkDuplicates(
    userData: RegistrationInput
  ): Promise<CheckDuplicatesResponse> {
    const existingUsername = await prisma.user.findFirst({
      where: {
        username: userData.username,
      },
    });

    let existingEmail = null;
    if (userData.email) {
      existingEmail = await prisma.user.findFirst({
        where: {
          email: userData.email,
        },
      });
    }

    return {
      isExisting:
        existingUsername !== null ||
        (userData.email ? existingEmail !== null : false),
    };
  }

  async createUser(
    userData: RegistrationInput,
    db: DBClient = prisma
  ): Promise<RegistrationResponse> {
    if (userData.password !== userData.confirmPassword) {
      return { success: false, error: "Passwords do not match" };
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = await prisma.user.create({
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email ?? undefined,
        username: userData.username,
        id: userData.id,
        role: userData.role,
        office: userData.office ?? undefined,
        companyId: userData.companyId ?? undefined,
        passwordHash: hashedPassword,
        isVerified: userData.role === "CITIZEN" ? false : null,
      },
    });

    return {
      success: true,
      data: user.username,
    };
  }

  async retrieveUser(userData: LoginInput): Promise<LoginResponse> {
    const user = await prisma.user.findUnique({
      where: {
        username: userData.username,
      },
    });

    if (!user) {
      return { success: false, error: "Invalid credentials" };
    }

    // Check if CITIZEN user is verified
    if (user.role === "CITIZEN" && user.isVerified === false) {
      return {
        success: false,
        error:
          "Account verification pending. Please check your email for the verification code.",
      };
    }

    const passwordMatch = await bcrypt.compare(
      userData.password,
      user.passwordHash
    );

    if (!passwordMatch) {
      return { success: false, error: "Invalid credentials" };
    }

    const { passwordHash, ...rest } = user;
    return {
      success: true,
      data: {
        email: rest.email ?? undefined,
        office: rest.office ?? undefined,
        companyId: rest.companyId ?? undefined,
        id: rest.id,
        firstName: rest.firstName,
        lastName: rest.lastName,
        username: rest.username,
        role: rest.role,
        telegram: rest.telegram ?? undefined,
      },
    };
  }
  catch(error) {
    throw new Error("Failed to fetch user from database");
  }

  async updateNotificationsMedia(
    userId: string,
    email: string | null,
    removeTelegram: boolean,
    db: DBClient = prisma
  ): Promise<RegistrationResponse> {
    if (email === null && removeTelegram === false) {
      return {
        success: false,
        error: "At least one contact method must be provided",
      };
    }
    const data: any = {};

    if (email !== null) {
      data.email = email;
    }

    if (removeTelegram) {
      data.telegram = null;
    }

    await db.user.update({
      where: { username: userId },
      data,
    });
    return {
      success: true,
      data: userId,
    };
  }

  async getUserByTelegramId(telegramId: string): Promise<RegistrationResponse> {
    const user = await prisma.user.findUnique({
      where: {
        telegramChatId: telegramId,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "No user found with the provided telegram ID.",
      };
    }
    return {
      success: true,
      data: user.id,
    };
  }

  async getUserById(userId: string) {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
        include: {
          company: true,
        },
      });
    } catch (error) {
      console.error("Failed to fetch user from database", error);
      return null;
    }
  }
  async getUserWithCompany(userId: string) {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });
    } catch (error) {
      console.error("Failed to fetch user with company from database", error);
      return null;
    }
  }

  async deleteUserById(userId: string) {
    await prisma.user.delete({
      where: { id: userId },
    });
  }

  // [NEW] Fetch all staff members
  async getAllOfficers(db: DBClient = prisma) {
    try {
      const users = await db.user.findMany({
        where: {
          role: {
            in: [
              "PUBLIC_RELATIONS_OFFICER",
              "TECHNICAL_OFFICER",
              "EXTERNAL_MAINTAINER_WITH_ACCESS",
              "EXTERNAL_MAINTAINER_WITHOUT_ACCESS",
              "ADMIN",
            ],
          },
        },
        include: {
          company: true, // Fetch company details for Maintainers
        },
        orderBy: {
          lastName: "asc", // Sort alphabetically
        },
      });

      // Map to a clean structure (remove passwords)
      return users.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        office: user.office,
        company: user.company?.name,
        companyId: user.companyId,
        email: user.email,
      }));
    } catch (error) {
      console.error("Failed to fetch officers:", error);
      return [];
    }
  }

  async updateUser(
    userId: string,
    userData: RegistrationInput,
    db: DBClient = prisma
  ): Promise<RegistrationResponse> {
    // 1. Password Handling (If provided)
    let passwordHash = undefined;
    if (userData.password) {
      if (userData.password !== userData.confirmPassword) {
        return { success: false, error: "Passwords do not match" };
      }
      passwordHash = await bcrypt.hash(userData.password, 12);
    }

    try {
      // 2. Cancellation Logic (Sanitizing data based on Role)
      // If we are changing to ADMIN, we must "cancel" (nullify) office and companyId
      const cleanOffice =
        userData.role === "TECHNICAL_OFFICER" ||
        userData.role === "PUBLIC_RELATIONS_OFFICER"
          ? userData.office
          : null; // Cancel office if not an Officer

      const cleanCompanyId =
        userData.role === "EXTERNAL_MAINTAINER_WITH_ACCESS" ||
        userData.role === "EXTERNAL_MAINTAINER_WITHOUT_ACCESS"
          ? userData.companyId
          : null; // Cancel company if not a Maintainer

      // 3. Perform the Update
      const user = await db.user.update({
        where: { id: userId },
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          username: userData.username,
          role: userData.role,

          // Apply sanitized/cancelled fields
          office: cleanOffice,
          companyId: cleanCompanyId,

          // Only update password if a new one was generated
          ...(passwordHash && { passwordHash }),
        },
      });

      return {
        success: true,
        data: user.username,
      };
    } catch (error) {
      console.error("Failed to update user:", error);
      // specific error handling for unique constraints (username/email)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return { success: false, error: "Username or Email already exists" };
      }
      return { success: false, error: "Failed to update user in database" };
    }
  }
}

export { UserRepository };
