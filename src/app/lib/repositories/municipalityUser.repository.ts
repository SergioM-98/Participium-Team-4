"use server";

import { prisma } from "@/db/db";
import {
  RetrieveMunicipalityResponse,
  SetRoleResponse,
} from "@/app/lib/dtos/municipalityUser.dto";

class MunicipalityUserRepository {
  async assignRole(userId: bigint, roleId: bigint): Promise<SetRoleResponse> {
    try {
      await prisma.municipalityUser.update({
        where: { id: userId },
        data: { roleId: roleId },
      });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  async retrieveMunicipalityUsers(): Promise<RetrieveMunicipalityResponse> {
    try {
      const users = await prisma.municipalityUser.findMany({
        include: {
          role: true,
          department: true,
        },
      });

      const formattedUsers = users.map((user: any) => ({
        id: String(user.id),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role.name,
        department: user.department.name,
      }));

      return { success: true, data: formattedUsers };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }
}

export { MunicipalityUserRepository };
