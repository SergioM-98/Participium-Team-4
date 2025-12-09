import { prisma } from "../../setup";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth/next";
import { updateOfficerOffices, getAllofficers, deleteOfficer } from "../../../src/app/lib/controllers/user.controller";
import { Role, Offices } from "@prisma/client";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    handlers: { GET: jest.fn(), POST: jest.fn() },
    auth: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  })),
}));

jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

describe("Story 10 - Integration Test: Modify Officer Offices", () => {
  let testAdminId: string;
  let testTechnicalOfficerId: string;
  let testPublicRelationsOfficerId: string;

  beforeEach(async () => {
    if (prisma.notification) await prisma.notification.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.photo.deleteMany({});
    await prisma.report.deleteMany({});
    if (prisma.profilePhoto) await prisma.profilePhoto.deleteMany({});
    if (prisma.notificationPreferences)
      await prisma.notificationPreferences.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.company.deleteMany({});

    const passwordHash = await bcrypt.hash("testpassword", 12);

    const admin = await prisma.user.create({
      data: {
        username: "admin_story10",
        firstName: "Admin",
        lastName: "User",
        email: undefined,
        passwordHash,
        role: [Role.ADMIN],
        isVerified: true,
      },
    });
    testAdminId = admin.id;

    const technicalOfficer = await prisma.user.create({
      data: {
        username: "technicalofficer_story10",
        firstName: "Tech",
        lastName: "Officer",
        email: undefined,
        passwordHash,
        role: [Role.TECHNICAL_OFFICER],
        office: [Offices.DEPARTMENT_OF_COMMERCE],
        isVerified: true,
      },
    });
    testTechnicalOfficerId = technicalOfficer.id;

    const prOfficer = await prisma.user.create({
      data: {
        username: "profficer_story10",
        firstName: "PR",
        lastName: "Officer",
        email: undefined,
        passwordHash,
        role: [Role.PUBLIC_RELATIONS_OFFICER],
        office: [Offices.DEPARTMENT_OF_EDUCATIONAL_SERVICES],
        isVerified: true,
      },
    });
    testPublicRelationsOfficerId = prOfficer.id;
  });

  afterEach(async () => {
    if (prisma.notification) await prisma.notification.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.photo.deleteMany({});
    await prisma.report.deleteMany({});
    if (prisma.profilePhoto) await prisma.profilePhoto.deleteMany({});
    if (prisma.notificationPreferences)
      await prisma.notificationPreferences.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.company.deleteMany({});
  });

  describe("Admin modifies officer offices", () => {
    it("should successfully update technical officer offices", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testAdminId,
          role: [Role.ADMIN],
        },
      });

      const newOffices = [
        Offices.DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES.toString(),
        Offices.DEPARTMENT_OF_FINANCIAL_RESOURCES.toString(),
      ];

      const result = await updateOfficerOffices(
        testTechnicalOfficerId,
        newOffices
      );

      expect(result).toBe(true);

      const updatedOfficer = await prisma.user.findUnique({
        where: { id: testTechnicalOfficerId },
      });

      expect(updatedOfficer?.office).toEqual(
        expect.arrayContaining([
          Offices.DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES,
          Offices.DEPARTMENT_OF_FINANCIAL_RESOURCES,
        ])
      );
      expect(updatedOfficer?.office.length).toBe(2);
    });

    it("should successfully add multiple offices to officer", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testAdminId,
          role: [Role.ADMIN],
        },
      });

      const newOffices = [
        Offices.DEPARTMENT_OF_COMMERCE.toString(),
        Offices.DEPARTMENT_OF_EDUCATIONAL_SERVICES.toString(),
        Offices.DEPARTMENT_OF_INTERNAL_SERVICES.toString(),
      ];

      const result = await updateOfficerOffices(
        testTechnicalOfficerId,
        newOffices
      );

      expect(result).toBe(true);

      const updatedOfficer = await prisma.user.findUnique({
        where: { id: testTechnicalOfficerId },
      });

      expect(updatedOfficer?.office.length).toBe(3);
      expect(updatedOfficer?.office).toEqual(
        expect.arrayContaining([
          Offices.DEPARTMENT_OF_COMMERCE,
          Offices.DEPARTMENT_OF_EDUCATIONAL_SERVICES,
          Offices.DEPARTMENT_OF_INTERNAL_SERVICES,
        ])
      );
    });

    it("should successfully remove offices from officer", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testAdminId,
          role: [Role.ADMIN],
        },
      });

      await prisma.user.update({
        where: { id: testTechnicalOfficerId },
        data: {
          office: [
            Offices.DEPARTMENT_OF_COMMERCE,
            Offices.DEPARTMENT_OF_EDUCATIONAL_SERVICES,
          ],
        },
      });

      const newOffices = [Offices.DEPARTMENT_OF_COMMERCE.toString()];

      const result = await updateOfficerOffices(
        testTechnicalOfficerId,
        newOffices
      );

      expect(result).toBe(true);

      const updatedOfficer = await prisma.user.findUnique({
        where: { id: testTechnicalOfficerId },
      });

      expect(updatedOfficer?.office.length).toBe(1);
      expect(updatedOfficer?.office).toContain(Offices.DEPARTMENT_OF_COMMERCE);
    });

    it("should successfully replace all offices", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testAdminId,
          role: [Role.ADMIN],
        },
      });

      await prisma.user.update({
        where: { id: testTechnicalOfficerId },
        data: {
          office: [
            Offices.DEPARTMENT_OF_COMMERCE,
            Offices.DEPARTMENT_OF_EDUCATIONAL_SERVICES,
          ],
        },
      });

      const newOffices = [
        Offices.DEPARTMENT_OF_CULTURE_SPORT_MAJOR_EVENTS_AND_TOURISM_PROMOTION.toString(),
      ];

      const result = await updateOfficerOffices(
        testTechnicalOfficerId,
        newOffices
      );

      expect(result).toBe(true);

      const updatedOfficer = await prisma.user.findUnique({
        where: { id: testTechnicalOfficerId },
      });

      expect(updatedOfficer?.office.length).toBe(1);
      expect(updatedOfficer?.office).toContain(
        Offices.DEPARTMENT_OF_CULTURE_SPORT_MAJOR_EVENTS_AND_TOURISM_PROMOTION
      );
    });
  });

  describe("Authorization tests", () => {
    it("should reject update if user is not admin", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testTechnicalOfficerId,
          role: [Role.TECHNICAL_OFFICER],
        },
      });

      const newOffices = [Offices.DEPARTMENT_OF_COMMERCE.toString()];

      const result = await updateOfficerOffices(
        testTechnicalOfficerId,
        newOffices
      );

      expect(result).toBe(false);

      const officer = await prisma.user.findUnique({
        where: { id: testTechnicalOfficerId },
      });
      expect(officer?.office).toEqual([Offices.DEPARTMENT_OF_COMMERCE]);
    });

    it("should reject update if session does not exist", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const newOffices = [Offices.DEPARTMENT_OF_COMMERCE.toString()];

      const result = await updateOfficerOffices(
        testTechnicalOfficerId,
        newOffices
      );

      expect(result).toBe(false);
    });
  });

  describe("Get all officers", () => {
    it("should retrieve all officers successfully", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testAdminId,
          role: [Role.ADMIN],
        },
      });

      const result = await getAllofficers();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.length).toBeGreaterThanOrEqual(1);
        
        const techOfficer = result.data.find(
          (o: any) => o.id === testTechnicalOfficerId
        );
        expect(techOfficer).toBeDefined();
        expect(techOfficer?.role).toContain(Role.TECHNICAL_OFFICER);
        expect(techOfficer?.office).toContain(Offices.DEPARTMENT_OF_COMMERCE);
      }
    });

    it("should reject getAllofficers if user is not admin", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testTechnicalOfficerId,
          role: [Role.TECHNICAL_OFFICER],
        },
      });

      const result = await getAllofficers();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized access");
    });
  });

  describe("Delete officer", () => {
    it("should successfully delete officer", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testAdminId,
          role: [Role.ADMIN],
        },
      });

      const result = await deleteOfficer(testTechnicalOfficerId);

      expect(result).toBe(true);

      const deletedOfficer = await prisma.user.findUnique({
        where: { id: testTechnicalOfficerId },
      });

      expect(deletedOfficer).toBeNull();
    });

    it("should reject delete if user is not admin", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testTechnicalOfficerId,
          role: [Role.TECHNICAL_OFFICER],
        },
      });

      const result = await deleteOfficer(testPublicRelationsOfficerId);

      expect(result).toBe(false);

      const officer = await prisma.user.findUnique({
        where: { id: testPublicRelationsOfficerId },
      });

      expect(officer).not.toBeNull();
    });
  });

  describe("Edge cases", () => {
    it("should handle updating non-existent officer", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testAdminId,
          role: [Role.ADMIN],
        },
      });

      const newOffices = [Offices.DEPARTMENT_OF_COMMERCE.toString()];

      const result = await updateOfficerOffices("non-existent-id", newOffices);

      expect(result).toBe(false);
    });

    it("should handle empty offices array", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testAdminId,
          role: [Role.ADMIN],
        },
      });

      const result = await updateOfficerOffices(testTechnicalOfficerId, []);

      expect(result).toBe(true);

      const updatedOfficer = await prisma.user.findUnique({
        where: { id: testTechnicalOfficerId },
      });

      expect(updatedOfficer?.office.length).toBe(0);
    });

    it("should handle multiple consecutive updates", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: testAdminId,
          role: [Role.ADMIN],
        },
      });

      await updateOfficerOffices(testTechnicalOfficerId, [
        Offices.DEPARTMENT_OF_COMMERCE.toString(),
      ]);

      await updateOfficerOffices(testTechnicalOfficerId, [
        Offices.DEPARTMENT_OF_EDUCATIONAL_SERVICES.toString(),
      ]);

      const result = await updateOfficerOffices(testTechnicalOfficerId, [
        Offices.DEPARTMENT_OF_INTERNAL_SERVICES.toString(),
      ]);

      expect(result).toBe(true);

      const updatedOfficer = await prisma.user.findUnique({
        where: { id: testTechnicalOfficerId },
      });

      expect(updatedOfficer?.office).toEqual([
        Offices.DEPARTMENT_OF_INTERNAL_SERVICES,
      ]);
    });
  });
});
