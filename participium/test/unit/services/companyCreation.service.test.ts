import { CompanyCreationService } from "@/services/companyCreation.service";
import { CompanyRepository } from "@/repositories/company.repository";

const mockCompanyRepository = {
  createCompany: jest.fn(),
};

jest.mock("@/repositories/company.repository", () => ({
  CompanyRepository: {
    getInstance: jest.fn(),
  },
}));

describe("CompanyCreationService", () => {
  let service: CompanyCreationService;

  beforeEach(() => {
    (CompanyRepository.getInstance as jest.Mock).mockReturnValue(
      mockCompanyRepository
    );
    service = CompanyCreationService.getInstance();
    jest.clearAllMocks();
  });

  describe("createCompany", () => {
    it("should create company successfully with valid data", async () => {
      mockCompanyRepository.createCompany.mockResolvedValue({
        id: "123",
        name: "Acme",
        email: "test@acme.com",
      });

      const result = await service.createCompany({
        name: "Acme",
        email: "test@acme.com",
        phone: "123456",
        hasAccess: true,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBe("Company created successfully");
      expect(mockCompanyRepository.createCompany).toHaveBeenCalledWith({
        name: "Acme",
        email: "test@acme.com",
        phone: "123456",
        hasAccess: true,
      });
    });

    it("should return error if company name is missing", async () => {
      const result = await service.createCompany({
        email: "test@acme.com",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Company name is required");
      expect(mockCompanyRepository.createCompany).not.toHaveBeenCalled();
    });

    it("should return error if company email is missing", async () => {
      const result = await service.createCompany({
        name: "Acme",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Company email is required");
      expect(mockCompanyRepository.createCompany).not.toHaveBeenCalled();
    });

    it("should handle repository failure (create returns null)", async () => {
      mockCompanyRepository.createCompany.mockResolvedValue(null);

      const result = await service.createCompany({
        name: "Acme",
        email: "fail@acme.com",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Company creation failed");
    });

    it("should default hasAccess to false if not provided", async () => {
      mockCompanyRepository.createCompany.mockResolvedValue({});

      await service.createCompany({
        name: "Acme",
        email: "test@acme.com",
      });

      expect(mockCompanyRepository.createCompany).toHaveBeenCalledWith(
        expect.objectContaining({ hasAccess: false })
      );
    });
  });
});
