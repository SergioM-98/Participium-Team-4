import {
  CheckDuplicatesResponse,
  LoginInput,
  LoginResponse,
  RegistrationInput,
  RegistrationResponse,
} from "@/dtos/citizen.dto";
import { prisma } from "@/db/db";
import bcrypt from "bcrypt";

class CitizenRepository {
  async checkDuplicates(
    userData: RegistrationInput
  ): Promise<CheckDuplicatesResponse> {
    try {
      const citizen = await prisma.citizen.findUnique({
        where: {
          username: userData.username,
          email: userData.email,
        },
      });

      return {
        isExisting: citizen !== null,
      };
    } catch (error) {
      throw new Error("Failed to fetch citizen from database");
    }
  }

  async createCitizen(
    userData: RegistrationInput
  ): Promise<RegistrationResponse> {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      const citizen = await prisma.citizen.create({
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          username: userData.username,
          passwordHash: hashedPassword,
        },
      });

      return {
        success: true,
        data: citizen.username,
      };
    } catch (error) {
      throw new Error("Failed to fetch citizen from database");
    }
  }

  async retrieveCitizen(userData: LoginInput): Promise<LoginResponse> {
    try {
      const citizen = await prisma.citizen.findUnique({
        where: {
          email: userData.email,
        },
      });

      if (!citizen) {
        return { success: false, error: "Invalid credentials" };
      }

      const passwordMatch = await bcrypt.compare(
        userData.password,
        citizen.passwordHash
      );

      if (!passwordMatch) {
        return { success: false, error: "Invalid credentials" };
      }

      const retrievedUserData = {
        id: citizen.id,
        firstName: citizen.firstName,
        lastName: citizen.lastName,
        username: citizen.username,
        email: citizen.email,
      };

      return {
        success: true,
        data: retrievedUserData,
      };
    } catch (error) {
      throw new Error("Failed to fetch citizen from database");
    }
  }
}

export { CitizenRepository };
