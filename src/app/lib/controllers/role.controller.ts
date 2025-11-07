"use server";

import {
  CreateRoleInput,
  CreateRoleResponse,
  RetrieveRolesResponse,
} from "@/dtos/role.dto";
import { RoleRepository } from "@/repositories/role.repository";

class RoleController {
  private roleRepository: RoleRepository;

  constructor() {
    this.roleRepository = new RoleRepository();
  }

  async setRole(userData: CreateRoleInput): Promise<CreateRoleResponse> {
    return await this.roleRepository.createRole(userData.name, userData.level);
  }

  async getAllRoles(): Promise<RetrieveRolesResponse> {
    return await this.roleRepository.getAllRoles();
  }
}

export { RoleController };
