import { CompanyRepository } from "@/repositories/company.repository";
import { prisma } from "@/prisma/db";

// 1. Mock the Prisma Client
jest.mock("@/prisma/db", () => ({
  prisma: {
    company: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe("CompanyRepository", () => {
  let repository: CompanyRepository;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Get the singleton instance
    repository = CompanyRepository.getInstance();
  });

  describe("createCompany", () => {
    it("should create a company with all fields provided", async () => {
      const mockInput = {
        name: "Acme Corp",
        email: "contact@acme.com",
        phone: "1234567890",
        hasAccess: true,
      };

      const mockDbResult = {
        id: "1",
        ...mockInput,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.company.create as jest.Mock).mockResolvedValue(mockDbResult);

      const result = await repository.createCompany(mockInput);

      expect(prisma.company.create).toHaveBeenCalledWith({
        data: {
          name: "Acme Corp",
          email: "contact@acme.com",
          phone: "1234567890",
          hasAccess: true,
        },
      });
      expect(result).toEqual(mockDbResult);
    });

    it("should create a company without optional phone number", async () => {
      const mockInput = {
        name: "Acme Corp",
        email: "contact@acme.com",
        phone: null, // explicit null
        hasAccess: true,
      };

      (prisma.company.create as jest.Mock).mockResolvedValue({
        id: "1",
        ...mockInput,
      });

      await repository.createCompany(mockInput);

      // Verify 'phone' key is NOT in the data object passed to Prisma
      expect(prisma.company.create).toHaveBeenCalledWith({
        data: {
          name: "Acme Corp",
          email: "contact@acme.com",
          hasAccess: true,
          // phone should be missing
        },
      });
    });

    it("should default hasAccess to false if undefined", async () => {
      const mockInput = {
        name: "Acme Corp",
        email: "contact@acme.com",
        // hasAccess missing
      };

      (prisma.company.create as jest.Mock).mockResolvedValue({ id: "1" });

      await repository.createCompany(mockInput);

      expect(prisma.company.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          hasAccess: false,
        }),
      });
    });

    it("should throw an error if Prisma fails", async () => {
      (prisma.company.create as jest.Mock).mockRejectedValue(
        new Error("Database connection error")
      );

      await expect(
        repository.createCompany({ name: "Fail", email: "fail@test.com" })
      ).rejects.toThrow("Database connection error");
    });
  });

  describe("getCompaniesByAccess", () => {
    it("should return companies filtered by access = true", async () => {
      const mockCompanies = [
        { id: "1", name: "Comp A", hasAccess: true },
        { id: "2", name: "Comp B", hasAccess: true },
      ];

      (prisma.company.findMany as jest.Mock).mockResolvedValue(mockCompanies);

      const result = await repository.getCompaniesByAccess(true);

      expect(prisma.company.findMany).toHaveBeenCalledWith({
        where: { hasAccess: true },
      });
      expect(result).toEqual(mockCompanies);
    });

    it("should return companies filtered by access = false", async () => {
      const mockCompanies = [{ id: "3", name: "Comp C", hasAccess: false }];

      (prisma.company.findMany as jest.Mock).mockResolvedValue(mockCompanies);

      const result = await repository.getCompaniesByAccess(false);

      expect(prisma.company.findMany).toHaveBeenCalledWith({
        where: { hasAccess: false },
      });
      expect(result).toEqual(mockCompanies);
    });

    it("should return empty array if no companies match", async () => {
      (prisma.company.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.getCompaniesByAccess(true);

      expect(result).toEqual([]);
      expect(prisma.company.findMany).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if Prisma findMany fails", async () => {
      (prisma.company.findMany as jest.Mock).mockRejectedValue(
        new Error("Database timeout")
      );

      await expect(repository.getCompaniesByAccess(true)).rejects.toThrow(
        "Database timeout"
      );
    });
  });
});
