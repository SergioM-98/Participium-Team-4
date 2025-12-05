import { Company } from "@prisma/client";
import { CompanyRepository } from "@/repositories/company.repository";
import { CompanyRegistrationResponse } from "@/dtos/company.dto";

class CompanyCreationService {
  private static instance: CompanyCreationService;
  private companyRepository: CompanyRepository;
  private constructor() {
    this.companyRepository = CompanyRepository.getInstance();
  }
  public static getInstance(): CompanyCreationService {
    if (!CompanyCreationService.instance) {
      CompanyCreationService.instance = new CompanyCreationService();
    }
    return CompanyCreationService.instance;
  }

  public async createCompany(
    companyData: Partial<Company>
  ): Promise<CompanyRegistrationResponse> {
    try {
      if (!companyData.name) {
        return { success: false, error: "Company name is required" };
      }

      if (!companyData.email) {
        return { success: false, error: "Company email is required" };
      }

      const response = await this.companyRepository.createCompany({
        name: companyData.name,
        email: companyData.email,
        phone: companyData.phone || undefined,
        hasAccess: companyData.hasAccess || false,
      });

      if (response) {
        return { success: true, data: "Company created successfully" };
      } else {
        return { success: false, error: "Company creation failed" };
      }
    } catch (error) {
      return { success: false, error: "Failed to create company" };
    }
  }
}

export { CompanyCreationService };
