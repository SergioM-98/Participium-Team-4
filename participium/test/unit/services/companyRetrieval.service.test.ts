import { CompanyRetrievalService } from "@/services/companyRetrieval.service";
import { CompanyRepository } from "@/repositories/company.repository";

const mockCompanyRepository = {
  getCompaniesByAccess: jest.fn(),
};

jest.mock("@/repositories/company.repository", () => ({
  CompanyRepository: {
    getInstance: jest.fn(),
  },
}));

describe("CompanyRetrievalService", () => {
  let service: CompanyRetrievalService;

  beforeEach(() => {
    (CompanyRepository.getInstance as jest.Mock).mockReturnValue(
      mockCompanyRepository
    );
    service = CompanyRetrievalService.getInstance();
    jest.clearAllMocks();
  });

  describe("getCompaniesByAccess", () => {
    it("should retrieve and map companies successfully", async () => {
      const dbResponse = [
        {
          id: "1",
          name: "Company A",
          email: "a@test.com",
          phone: "111",
          hasAccess: true,
          createdAt: new Date(), // Extra fields usually in DB object
        },
      ];

      mockCompanyRepository.getCompaniesByAccess.mockResolvedValue(dbResponse);

      const result = await service.getCompaniesByAccess(true);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      // Verify mapping structure (stripping createdAt, etc)
      expect(result.data![0]).toEqual({
        id: "1",
        name: "Company A",
        email: "a@test.com",
        phone: "111",
        hasAccess: true,
      });
      expect(mockCompanyRepository.getCompaniesByAccess).toHaveBeenCalledWith(
        true
      );
    });

    it("should handle null values in DB response gracefully", async () => {
      // Simulating DB row with nulls
      const dbResponse = [
        {
          id: "2",
          name: "Company B",
          email: null,
          phone: null,
          hasAccess: null,
        },
      ];

      mockCompanyRepository.getCompaniesByAccess.mockResolvedValue(dbResponse);

      const result = await service.getCompaniesByAccess(false);

      expect(result.success).toBe(true);
      expect(result.data![0]).toEqual({
        id: "2",
        name: "Company B",
        email: undefined, // mapped from null
        phone: undefined, // mapped from null
        hasAccess: false, // mapped from null/undefined
      });
    });

    it("should return error if repository returns null", async () => {
      mockCompanyRepository.getCompaniesByAccess.mockResolvedValue(null);

      const result = await service.getCompaniesByAccess(true);

      expect(result.success).toBe(false);
      expect(result.error).toBe("No companies found");
    });

    it("should return empty array if repository returns empty list", async () => {
      mockCompanyRepository.getCompaniesByAccess.mockResolvedValue([]);

      const result = await service.getCompaniesByAccess(true);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });
});
