import {
  CheckDuplicatesResponse,
  LoginInput,
  LoginResponse,
  RegistrationInput,
  RegistrationResponse,
} from "@/schemas/officer.schema";
import { prisma } from "@/services/db";
import bcrypt from "bcrypt";

class OfficerRepository {
  async checkDuplicates(
    userData: RegistrationInput
  ): Promise<CheckDuplicatesResponse> {
    try {
      const officer = await prisma.officer.findUnique({
        where: {
          username: userData.username
        },
      });

      return {
        isExisting: officer !== null,
      };
    } catch (error) {
      throw new Error("Failed to fetch officer from database");
    }
  }

  async createOfficer(
    userData: RegistrationInput
  ): Promise<RegistrationResponse> {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      const officer = await prisma.officer.create({
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          username: userData.username,
          passwordHash: hashedPassword,
        },
      });

      return {
        success: true,
        data: officer.username,
      };
    } catch (error) {
      throw new Error("Failed to fetch officer from database");
    }
  }

  async retrieveOfficer(userData: LoginInput): Promise<LoginResponse> {
    try {
      const officer = await prisma.officer.findUnique({
        where: {
          username: userData.username,
        },
      });

      if (!officer) {
        return { success: false, error: "Invalid credentials" };
      }

      const passwordMatch = await bcrypt.compare(
        userData.password,
        officer.passwordHash
      );

      if (!passwordMatch) {
        return { success: false, error: "Invalid credentials" };
      }

      const retrievedUserData = {
        firstName: officer.firstName,
        lastName: officer.lastName,
        username: officer.username,
      };

      return {
        success: true,
        data: retrievedUserData,
      };
    } catch (error) {
      throw new Error("Failed to fetch officer from database");
    }
  }
}

export { OfficerRepository };