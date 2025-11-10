"use server";

import { ReportRepository } from "@/app/lib/repositories/report.repository";
import {
  CreateReviewInput,
  CreateReviewResponse,
  RetrieveReportsByStatusInput,
} from "@/app/lib/dtos/report.dto";
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

  async retrieveReportsByStatus(userData: RetrieveReportsByStatusInput) {
    return await this.reportRepository.retrieveReportsByStatus(userData);
  }

  // Metodo per la creazione di report da cittadini
  async createReport(
    uuid: string,
    title: string,
    description: string,
    photos: string[],
    longitude: number,
    latitude: number,
    userId: string
  ) {
    return await this.reportRepository.createReport(
      uuid,
      title,
      description,
      photos,
      longitude,
      latitude,
      userId
    );
  }
}

export { ReportController };
