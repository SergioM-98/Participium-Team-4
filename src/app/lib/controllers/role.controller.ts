import { CreateRoleInput, CreateRoleResponse } from "@/app/lib/dtos/role.dto";
import { RoleRepository } from "../repositories/role.repository";

class RoleController {
  private roleRepository: RoleRepository;

  constructor() {
    this.roleRepository = new RoleRepository();
  }

  async setRole(userData: CreateRoleInput): Promise<CreateRoleResponse> {
    return await this.roleRepository.createRole(userData.name, userData.level);
  }
}

export { RoleController };
