"use server";

import {
  RetrieveMunicipalityResponse,
  SetRoleInput,
  SetRoleResponse,
} from "@/app/lib/dtos/municipalityUser.dto";
import { MunicipalityUserRepository } from "@/repositories/municipalityUser.repository";
import { RoleRepository } from "@/repositories/role.repository";

class MunicipalityUserController {
  private municipalityUserRepository: MunicipalityUserRepository;
  private roleRepository: RoleRepository;

  constructor() {
    this.municipalityUserRepository = new MunicipalityUserRepository();
    this.roleRepository = new RoleRepository();
  }

  async setRole(userData: SetRoleInput): Promise<SetRoleResponse> {
    const role = await this.roleRepository.findRoleByName(userData.role);

    if (!role) {
      return { success: false, error: "Role not found" };
    }

    console.log("Assigning role ID:", role.id, "to user ID:", userData.id);

    return await this.municipalityUserRepository.assignRole(
      userData.id,
      BigInt(role.id)
    );
  }

  async retrieveMunicipalityUsers(): Promise<RetrieveMunicipalityResponse> {
    return await this.municipalityUserRepository.retrieveMunicipalityUsers();
  }
}

export { MunicipalityUserController };
