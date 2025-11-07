import { CitizenRepository } from "@/repositories/citizen.repository";
import {
  LoginInput,
  LoginResponse,
  RegistrationInput,
  RegistrationResponse,
} from "@/app/lib/dtos/citizen.dto";

class CitizenController {
  private citizenRepository: CitizenRepository;

  constructor() {
    this.citizenRepository = new CitizenRepository();
  }

  async checkDuplicates(userData: RegistrationInput) {
    return await this.citizenRepository.checkDuplicates(userData);
  }

  async createCitizen(
    userData: RegistrationInput
  ): Promise<RegistrationResponse> {
    return await this.citizenRepository.createCitizen(userData);
  }

  async retrieveCitizen(userData: LoginInput): Promise<LoginResponse> {
    return await this.citizenRepository.retrieveCitizen(userData);
  }
}

export { CitizenController };
