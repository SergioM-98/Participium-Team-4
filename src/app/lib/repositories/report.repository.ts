import { prisma } from "@/services/db";
import {
  CreateReviewInput,
  CreateReviewResponse,
} from "@/app/lib/dtos/report.dto";
import { Department } from "@/app/lib/dtos/department.dto";

class ReportRepository {
  async createReview(
    userData: CreateReviewInput,
    department: Department
  ): Promise<CreateReviewResponse> {
    try {
      await prisma.report.update({
        where: {
          id: userData.reportId,
        },
        data: {
          decision: userData.decision,
          explaination: userData.explaination,
          category: userData.category,
          assignedDepartment: department.id,
        },
      });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  async retrieveUnreviewedReports() {
    try {
      const reports = await prisma.report.findMany({
        where: {
          decision: null,
        },
      });
      return reports;
    } catch (error) {
      console.error("Error retrieving unreviewed reports:", error);
      throw new Error("Could not retrieve unreviewed reports");
    }
  }

  async retrieveValidReports() {
    try {
      const reports = await prisma.report.findMany({
        where: {
          decision: "APPROVED",
        },
      });
      return reports;
    } catch (error) {
      console.error("Error retrieving valid reports:", error);
      throw new Error("Could not retrieve valid reports");
    }
  }
}

export { ReportRepository };
