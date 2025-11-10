"use server";

import {
  CheckDuplicatesResponse,
  LoginInput,
  LoginResponse,
  RegistrationInput,
  RegistrationResponse,
} from "@/dtos/user.dto";
import { prisma } from "@/db/db";
import bcrypt from "bcrypt";

class UserRepository {
  async checkDuplicates(
    userData: RegistrationInput
  ): Promise<CheckDuplicatesResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: {
          username: userData.username,
        },
      });

      return {
        isExisting: user !== null,
      };
    } catch (error) {
      throw new Error("Failed to fetch user from database");
    }
  }

  async createUser(
    userData: RegistrationInput
  ): Promise<RegistrationResponse> {
    try {
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
      return {success: true,
              data: {
                ...rest,
                email: rest.email ?? undefined,
                office: rest.office ?? undefined,
                telegram: rest.telegram ?? undefined
              }};

    } catch (error) {
      throw new Error("Failed to fetch user from database");
    }
  }
}

export { UserRepository };
