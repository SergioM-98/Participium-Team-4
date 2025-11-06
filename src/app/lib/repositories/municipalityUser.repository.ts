import { prisma } from "../../../../prisma/db";
import { SetRoleResponse } from "../dtos/municipalityUser.dtos";

class MunicipalityUserRepository {
  async assignRole(userId: bigint, role: string): Promise<SetRoleResponse> {
    try {
      await prisma.municipalityUser.update({
        where: { id: userId },
        data: { role: role },
      });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }
}

export { MunicipalityUserRepository };
