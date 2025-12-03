"use server";

import {
  CheckDuplicatesResponse,
  LoginInput,
  LoginResponse,
  RegistrationInput,
  RegistrationResponse,
} from "../dtos/user.dto";
import { prisma } from "../../../../prisma/db";
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

    const user = await db.user.create({
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email ?? undefined,
        username: userData.username,
        id: userData.id,
        role: userData.role,
        office: userData.office ?? undefined,
        passwordHash: hashedPassword,
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
        firstName: rest.firstName,
        lastName: rest.lastName,
        username: rest.username,
        role: rest.role,
        telegram: rest.telegramChatId ?? undefined,
        pendingRequest: rest.telegramRequestPending ?? undefined,
      },
    };
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
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if(!user){
      throw new Error("User not found");
    }
    if(user.role === "CITIZEN" && user.telegramRequestPending){
      if(user.telegramRequestTTL && user.telegramRequestTTL < (new Date())){
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            telegramToken: null,
            telegramRequestPending: false,
            telegramRequestTTL: null,
          },
        });
        console.log("Expired telegram request cleaned for user:", user.username);
      }
    }
    return user;
  }


}

export { UserRepository };
