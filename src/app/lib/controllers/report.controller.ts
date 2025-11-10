<<<<<<< HEAD
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
}

export { ReportController };
=======
'use server'
import { reportRequestSchema, ReportResponse } from '@/dtos/report.dto';
import { ReportCreationService } from '@/services/reportCreation.service';

export async function reportCreation(title: string, description: string, photos: string[], longitude: number, latitude: number, userId: string): Promise<ReportResponse> {
    try {
        const reportData = reportRequestSchema.parse({
            title,
            description,
            photos,
            longitude,
            latitude,
            userId
        });

        const reportCreationService = ReportCreationService.getInstance();
        const report = await reportCreationService.createReport(reportData);
        return report;
    } catch (error) {
        console.error('Error creating report:', error);
        throw error;
    }
}
>>>>>>> dev
