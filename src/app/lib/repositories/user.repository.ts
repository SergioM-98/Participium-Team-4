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
import { ca } from "zod/v4/locales";

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
    try {
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
    } catch (error) {
      throw new Error("Failed to fetch user from database");
    }
  }

  async createUser(userData: RegistrationInput): Promise<RegistrationResponse> {
    try {
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
          role: userData.role,
          office: userData.office ?? undefined,
          passwordHash: hashedPassword,
          telegram: userData.telegram ?? undefined,
        },
      });

      if(user.role === "CITIZEN") {
        await prisma.notificationPreferences.create({
          data: {
            userId: user.id
          },
        });
      }

      return {
        success: true,
        data: user.username,
      };
    } catch (error) {
      throw new Error("Failed to fetch user from database");
    }
  }

  async retrieveUser(userData: LoginInput): Promise<LoginResponse> {
    try {
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
          ...rest,
          email: rest.email ?? undefined,
          office: rest.office ?? undefined,
          telegram: rest.telegram ?? undefined,
        },
      };
    } catch (error) {
      throw new Error("Failed to fetch user from database");
    }
  }

  async updateNotificationsMedia(userId: string, telegram: string | null, email: string | null, removeTelegram:boolean): Promise<RegistrationResponse> {
  
    try {
      if(telegram === null && email === null && removeTelegram === false) {
        return { success: false, error: "At least one contact method must be provided" };
      }
      const data: any = {};

      if (email !== null) {
        data.email = email;
      }

      if (removeTelegram) {
        data.telegram = null;
      } else if (telegram !== null) {
        data.telegram = telegram;
      }

      await prisma.user.update({
        where: { username: userId },
        data,
      });
      return {
        success: true,
        data: userId,
      };
    }catch (error) {
      throw new Error("Failed to update user in database");
    }
  }


}

export { UserRepository };
