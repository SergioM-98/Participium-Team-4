import { prisma } from "@/db/db";
import {
  CreateReviewInput,
  CreateReviewResponse,
  RetrieveReportsByStatusInput,
  RetrieveReportsByStatusResponse,
} from "@/app/lib/dtos/report.dto";
import { Department } from "@/app/lib/dtos/department.dto";

class ReportRepository {


  // Creazione di un nuovo report
  public async createReport(
    uuid: string,
    title: string,
    description: string,
    photos: string[],
    longitude: number,
    latitude: number,
    userId: string
  ) {
    const report = await prisma.report.create({
      data: {
        id: uuid,
        title: title,
        description: description,
        photos: {
          connect: photos.map((photoId) => ({ id: photoId })),
        },
        longitude: longitude,
        latitude: latitude,
        userId: userId,
      },
    });
    return report;
  }

  // Review di un report
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
          status: userData.status,
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
          status: null,
        },
      });
      return reports;
    } catch (error) {
      console.error("Error retrieving unreviewed reports:", error);
      throw new Error("Could not retrieve unreviewed reports");
    }
  }

  async retrieveReportsByStatus(
    userData: RetrieveReportsByStatusInput
  ): Promise<RetrieveReportsByStatusResponse> {
    try {
      const reports = await prisma.report.findMany({
        where: {
          status: userData.status,
        },
      });
      return { success: true, data: reports };
    } catch (error) {
      console.error("Error retrieving valid reports:", error);
      return { success: false, error: "Could not retrieve valid reports" };
    }
  }
}

export { ReportRepository };
