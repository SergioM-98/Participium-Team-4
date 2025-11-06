import {
  SetRoleInput,
  SetRoleResponse,
} from "@/app/lib/dtos/municipalityUser.dtos";
import { MunicipalityUserRepository } from "@/repositories/municipalityUser.repository";

class MunicipalityUserController {
  private municipalityUserRepository: MunicipalityUserRepository;

  constructor() {
    this.municipalityUserRepository = new MunicipalityUserRepository();
  }

  async setRole(userData: SetRoleInput): Promise<SetRoleResponse> {
    return await this.municipalityUserRepository.assignRole(
      userData.id,
      userData.role
    );
  }
}

export { MunicipalityUserController };
