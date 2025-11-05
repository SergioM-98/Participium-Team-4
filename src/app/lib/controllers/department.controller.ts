import {
  CreateDepartmentInput,
  CreateDepartmentResponse,
  RetrieveDepartmentResponse,
  RetrieveDepartmentsResponse,
} from "@/app/lib/dtos/department.schema";
import { DepartmentRepository } from "../repositories/department.repository.schema";

class DepartmentController {
  private departmentRepository: DepartmentRepository;

  constructor() {
    this.departmentRepository = new DepartmentRepository();
  }

  async createDepartment(
    userData: CreateDepartmentInput
  ): Promise<CreateDepartmentResponse> {
    return await this.departmentRepository.createDepartment(userData.name);
  }

  async retrieveDepartment(
    userData: CreateDepartmentInput
  ): Promise<RetrieveDepartmentResponse> {
    return await this.departmentRepository.retrieveDepartment(userData.name);
  }

  async retrieveDepartments(): Promise<RetrieveDepartmentsResponse> {
    return await this.departmentRepository.retrieveDepartments();
  }
}

export { DepartmentController };
