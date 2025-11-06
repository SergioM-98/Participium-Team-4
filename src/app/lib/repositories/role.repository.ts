import { prisma } from "@/services/db";
import { CreateRoleResponse } from "@/app/lib/dtos/role.dto";

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
}

export { RoleRepository };
