import { prisma } from "@/db/db";
import {
  CreateDepartmentResponse,
  Department,
  RetrieveDepartmentResponse,
  RetrieveDepartmentsResponse,
} from "@/app/lib/dtos/department.dto";

class DepartmentRepository {
  async createDepartment(name: string): Promise<CreateDepartmentResponse> {
    try {
      const department = await prisma.department.create({
        data: {
          name: name,
        },
      });
      return { success: true, data: department.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  async retrieveDepartments(): Promise<RetrieveDepartmentsResponse> {
    try {
      const departments = await prisma.department.findMany();
      return {
        success: true,
        data: departments.map((dept: Department) => ({
          id: dept.id,
          name: dept.name,
        })),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  async retrieveDepartment(name: string): Promise<RetrieveDepartmentResponse> {
    try {
      const department = await prisma.department.findUnique({
        where: {
          name: name,
        },
      });
      if (!department) {
        throw new Error("Department not found");
      }
      return { success: true, data: department.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }
}

export { DepartmentRepository };
