import { ReportRepository } from "@/app/lib/repositories/report.repository";
import {
  CreateReviewInput,
  CreateReviewResponse,
} from "@/app/lib/dtos/report.schema";
import { DepartmentRepository } from "@/repositories/department.repository.schema";

class ReportController {
  private reportRepository: ReportRepository;
  private departmentRepository: DepartmentRepository;

  constructor() {
    this.reportRepository = new ReportRepository();
    this.departmentRepository = new DepartmentRepository();
  }

  async createReview(
    userData: CreateReviewInput
  ): Promise<CreateReviewResponse> {
    const department = await this.departmentRepository.retrieveDepartment(
      userData.category
    );

    if (!department.success) {
      return { success: false, error: department.error };
    }

    return await this.reportRepository.createReview(userData, department.data);
  }

  async retrieveUnreviewedReports() {
    return await this.reportRepository.retrieveUnreviewedReports();
  }

  async retrieveValidReports() {
    return await this.reportRepository.retrieveValidReports();
  }
}

export { ReportController };
