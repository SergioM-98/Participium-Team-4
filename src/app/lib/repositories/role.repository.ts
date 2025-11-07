"use server";

import { prisma } from "@/db/db";
import {
  CreateRoleResponse,
  RetrieveRolesResponse,
  Role,
} from "@/dtos/role.dto";

class RoleRepository {
  async createRole(name: string, level: number): Promise<CreateRoleResponse> {
    try {
      await prisma.role.create({
        data: {
          name: name,
          level: BigInt(level),
        },
      });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  async findRoleByName(name: string): Promise<Role | null> {
    try {
      const role = await prisma.role.findFirst({
        where: { name: name },
      });
      return role;
    } catch (error) {
      console.error("Error finding role by name:", error);
      return null;
    }
  }

  async getAllRoles(): Promise<RetrieveRolesResponse> {
    try {
      const roles = await prisma.role.findMany();

      return { success: true, data: roles };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }
}

export { RoleRepository };
