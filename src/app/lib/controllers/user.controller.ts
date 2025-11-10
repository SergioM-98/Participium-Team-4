"use server";

import { UserRepository } from "@/repositories/user.repository";
import {
  LoginInput,
  LoginResponse,
  RegistrationInput,
  RegistrationInputSchema,
  RegistrationResponse,
} from "@/app/lib/dtos/user.dto";


class UserController {
  constructor(private userRepository = new UserRepository()) {}


  async checkDuplicates(userData: RegistrationInput) {
    return await this.userRepository.checkDuplicates(userData);
  }

  async createUser(
    userData: RegistrationInput
  ): Promise<RegistrationResponse> {
    const parsed = RegistrationInputSchema.safeParse(userData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.message };
    }

    return await this.userRepository.createUser(parsed.data);
  }

  async retrieveUser(userData: LoginInput): Promise<LoginResponse> {
    return await this.userRepository.retrieveUser(userData);
  }
}

export { UserController };
