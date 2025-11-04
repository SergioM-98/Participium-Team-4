import { OfficerRepository } from "@/repositories/officer.repository";
import {
  LoginInput,
  LoginResponse,
  RegistrationInput,
  RegistrationResponse,
} from "@/schemas/officer.schema";

class OfficerController {
  private officerRepository: OfficerRepository;

  constructor() {
    this.officerRepository = new OfficerRepository();
  }

  async checkDuplicates(userData: RegistrationInput) {
    return await this.officerRepository.checkDuplicates(userData);
  }

  async createOfficer(
    userData: RegistrationInput
  ): Promise<RegistrationResponse> {
    return await this.officerRepository.createOfficer(userData);
  }

  async retrieveOfficer(userData: LoginInput): Promise<LoginResponse> {
    return await this.officerRepository.retrieveOfficer(userData);
  }
}

export { OfficerController };