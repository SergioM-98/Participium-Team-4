import { prisma } from "@/prisma/db";
import { Category, Report } from "@prisma/client";
import {
  ReportByOfficer,
  ReportRegistrationResponse,
  ReportsByOfficerIdResponse,
} from "@/dtos/report.dto";

class ReportRepository {
  private static instance: ReportRepository;

  private constructor() {}

  public static getInstance(): ReportRepository {
    if (!ReportRepository.instance) {
      ReportRepository.instance = new ReportRepository();
    }
    return ReportRepository.instance;
  }

  public async createReport(
    title: string,
    description: string,
    photos: string[],
    category: string,
    longitude: number,
    latitude: number,
    userId: string
  ): Promise<ReportRegistrationResponse> {
    try {
      category = category.toUpperCase();
      const report = await prisma.report.create({
        data: {
          title: title,
          description: description,
          photos: {
            connect: photos.map((photoId) => ({ id: photoId })),
          },
          category: Object.values(Category).includes(category as Category)
            ? (category as Category)
            : Category.OTHER,
          longitude: longitude,
          latitude: latitude,
          citizenId: Number(userId),
        },
      });
      return {
        success: true,
        data: `Report with id: ${report.id} succesfuly created`,
      };
    } catch {
      return {
        success: false,
        error: "Failed to add the report to the database",
      };
    }
  }

  public async getReportsByOfficerId(officerId: number) {
    return await prisma.report.findMany({
      where: {
        officerId,
      },
      include: {
        photos: {
          select: { filename: true },
        },
      },
    });
  }
}

export { ReportRepository };
