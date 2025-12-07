import { prisma } from "./db";
import { ReportStatus, Category } from "@prisma/client";

export default async function seedReports() {
  // Verify that a citizen exists
  const citizen = await prisma.user.findUnique({
    where: { username: "mneri" },
  });

  if (!citizen) {
    console.log("Citizen 'mneri' not found. Please create a citizen first.");
    return;
  }

  // Get or create an officer for assigned reports
  const officer = await prisma.user.findFirst({
    where: { role: "TECHNICAL_OFFICER" },
  });

  if (!officer) {
    console.log(
      "No technical officer found. Some reports won't be fully assigned.",
    );
  }

  // Clear existing sample reports (optional - comment out if you want to keep them)
  // await prisma.report.deleteMany({});

  const reports = [
    {
      title: "Pothole on Main Street",
      description: "There is a deep pothole that could be dangerous",
      status: ReportStatus.PENDING_APPROVAL,
      category: Category.ROADS_AND_URBAN_FURNISHINGS,
      longitude: 7.686,
      latitude: 45.061,
      citizenId: citizen.id,
      officerId: null,
      rejectionReason: null,
      companyId: null,
    },
    {
      title: "Broken streetlight in central plaza",
      description: "The streetlight hasn't been working for a week",
      status: ReportStatus.PENDING_APPROVAL,
      category: Category.PUBLIC_LIGHTING,
      longitude: 7.69,
      latitude: 45.063,
      citizenId: citizen.id,
      officerId: null,
      rejectionReason: null,
      companyId: null,
    },
    {
      title: "Fallen tree on Marina Street",
      description: "A tree has fallen on the road and is blocking traffic",
      status: ReportStatus.ASSIGNED,
      category: Category.PUBLIC_GREEN_AREAS_AND_BACKGROUNDS,
      longitude: 7.688,
      latitude: 45.065,
      citizenId: citizen.id,
      officerId: officer?.id || null,
      rejectionReason: null,
      companyId: null,
    },
    {
      title: "Abandoned waste behind the park",
      description: "Pile of improperly disposed waste",
      status: ReportStatus.IN_PROGRESS,
      category: Category.WASTE,
      longitude: 7.692,
      latitude: 45.062,
      citizenId: citizen.id,
      officerId: officer?.id || null,
      rejectionReason: null,
      companyId: null,
    },
    {
      title: "Missing traffic signs on Garibaldi Street",
      description: "Stop signs and traffic signals are missing",
      status: ReportStatus.SUSPENDED,
      category: Category.ROADS_SIGNS_AND_TRAFFIC_LIGHTS,
      longitude: 7.694,
      latitude: 45.06,
      citizenId: citizen.id,
      officerId: officer?.id || null,
      rejectionReason: null,
      companyId: null,
    },
    {
      title: "Architectural barrier at City Hall",
      description: "City Hall entrance is not accessible for disabled people",
      status: ReportStatus.REJECTED,
      category: Category.ARCHITECTURAL_BARRIERS,
      longitude: 7.696,
      latitude: 45.067,
      citizenId: citizen.id,
      officerId: officer?.id || null,
      rejectionReason: "Outside the scope of municipal administration",
      companyId: null,
    },
    {
      title: "Pothole repaired on Benedetto Street",
      description: "The pothole has been properly repaired",
      status: ReportStatus.RESOLVED,
      category: Category.ROADS_AND_URBAN_FURNISHINGS,
      longitude: 7.684,
      latitude: 45.064,
      citizenId: citizen.id,
      officerId: officer?.id || null,
      rejectionReason: null,
      companyId: null,
    },
    {
      title: "Water leak on Verdi Street",
      description: "Water is leaking from the main water pipe",
      status: ReportStatus.PENDING_APPROVAL,
      category: Category.WATER_SUPPLY,
      longitude: 7.687,
      latitude: 45.068,
      citizenId: citizen.id,
      officerId: null,
      rejectionReason: null,
      companyId: null,
    },
    {
      title: "Clogged sewer at Cathedral Square",
      description: "Water pooling in the square due to clogged sewer line",
      status: ReportStatus.ASSIGNED,
      category: Category.SEWER_SYSTEM,
      longitude: 7.691,
      latitude: 45.066,
      citizenId: citizen.id,
      officerId: officer?.id || null,
      rejectionReason: null,
      companyId: null,
    },
  ];

  // Check for existing reports to avoid duplicates
  const existingReports = await prisma.report.findMany({
    where: {
      title: {
        in: reports.map((r) => r.title),
      },
    },
  });

  const existingTitles = new Set(existingReports.map((r) => r.title));

  let createdCount = 0;
  for (const report of reports) {
    if (existingTitles.has(report.title)) {
      console.log(`Skipped existing report: ${report.title}`);
    } else {
      await prisma.report.create({
        data: report,
      });
      console.log(`Created report: ${report.title}`);
      createdCount++;
    }
  }

  console.log(`\nSeeding completed! Created ${createdCount} new reports.`);
}
