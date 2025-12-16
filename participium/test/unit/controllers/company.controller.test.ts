import {
  createCompany,
  getCompaniesByAccess,
  getAllCompanies,
} from "@/controllers/company.controller"; // Adjust path as needed
import { CompanyCreationService } from "@/services/companyCreation.service";
import { CompanyRetrievalService } from "@/services/companyRetrieval.service";
import { getServerSession } from "next-auth/next";

// 1. Setup Mocks for Services
const mockCreationService = {
  createCompany: jest.fn(),
};

const mockRetrievalService = {
  getCompaniesByAccess: jest.fn(),
};

// 2. Mock Modules
jest.mock("next-auth/next");
jest.mock("@/auth", () => ({
  authOptions: {},
}));

jest.mock("@/services/companyCreation.service", () => ({
  CompanyCreationService: {
    getInstance: jest.fn(),
  },
}));

jest.mock("@/services/companyRetrieval.service", () => ({
  CompanyRetrievalService: {
    getInstance: jest.fn(),
  },
}));

describe("CompanyController", () => {
  beforeEach(() => {
    (CompanyCreationService.getInstance as jest.Mock).mockReturnValue(
      mockCreationService
    );
    (CompanyRetrievalService.getInstance as jest.Mock).mockReturnValue(
      mockRetrievalService
    );
    jest.clearAllMocks();
  });

  describe("createCompany", () => {
    it("should create company successfully when user is ADMIN", async () => {
      // Mock Session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { role: ["ADMIN"] },
      });

      mockCreationService.createCompany.mockResolvedValue({
        success: true,
        data: "Company created successfully",
      });

      const formData = new FormData();
      formData.append("name", "Acme Corp");
      formData.append("email", "contact@acme.com");
      formData.append("phone", "1234567890");
      formData.append("hasAccess", "true");

      const result = await createCompany(formData);

      expect(result.success).toBe(true);
      expect(result.data).toBe("Company created successfully");
      expect(mockCreationService.createCompany).toHaveBeenCalledWith({
        name: "Acme Corp",
        email: "contact@acme.com",
        phone: "1234567890",
        hasAccess: true,
      });
    });

    it("should return unauthorized error if user is NOT ADMIN", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { role: ["USER"] },
      });

      const formData = new FormData();
      const result = await createCompany(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized access");
      expect(mockCreationService.createCompany).not.toHaveBeenCalled();
    });

    it("should return unauthorized error if session is null", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const formData = new FormData();
      const result = await createCompany(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized access");
    });

    it("should handle optional phone number correctly (undefined if empty)", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { role: ["ADMIN"] },
      });

      mockCreationService.createCompany.mockResolvedValue({
        success: true,
        data: "Company created successfully",
      });

      const formData = new FormData();
      formData.append("name", "Acme Corp");
      formData.append("email", "contact@acme.com");
      // No phone appended

      await createCompany(formData);

      expect(mockCreationService.createCompany).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Acme Corp",
          phone: undefined,
        })
      );
    });
  });

  describe("getCompaniesByAccess", () => {
    it("should retrieve companies by access status successfully", async () => {
      const mockData = [{ id: 1, name: "Test Co" }];
      mockRetrievalService.getCompaniesByAccess.mockResolvedValue({
        success: true,
        data: mockData,
      });

      const result = await getCompaniesByAccess(true);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(mockRetrievalService.getCompaniesByAccess).toHaveBeenCalledWith(
        true
      );
    });
  });

  describe("getAllCompanies", () => {
    it("should combine companies with and without access successfully", async () => {
      const accessData = [{ id: 1, name: "Access Co", hasAccess: true }];
      const noAccessData = [{ id: 2, name: "No Access Co", hasAccess: false }];

      mockRetrievalService.getCompaniesByAccess
        .mockResolvedValueOnce({ success: true, data: accessData }) // First call (true)
        .mockResolvedValueOnce({ success: true, data: noAccessData }); // Second call (false)

      const result = await getAllCompanies();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data).toEqual([...accessData, ...noAccessData]);
      expect(mockRetrievalService.getCompaniesByAccess).toHaveBeenCalledTimes(
        2
      );
    });

    it("should return error if fetching companies with access fails", async () => {
      mockRetrievalService.getCompaniesByAccess
        .mockResolvedValueOnce({ success: false, error: "DB Error" })
        .mockResolvedValueOnce({ success: true, data: [] });

      const result = await getAllCompanies();

      expect(result.success).toBe(false);
      expect(result.error).toBe("No companies found");
    });

    it("should handle empty lists gracefully", async () => {
      mockRetrievalService.getCompaniesByAccess
        .mockResolvedValueOnce({ success: true, data: [] })
        .mockResolvedValueOnce({ success: true, data: [] });

      const result = await getAllCompanies();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });
});
