import { CompanyRepository } from "@/repositories/company.repository";
import { CompaniesRetrievalResponse } from "@/dtos/company.dto";

class CompanyRetrievalService {
  private static instance: CompanyRetrievalService;
  private companyRepository: CompanyRepository;
  private constructor() {
    this.companyRepository = CompanyRepository.getInstance();
  }
  public static getInstance(): CompanyRetrievalService {
    if (!CompanyRetrievalService.instance) {
      CompanyRetrievalService.instance = new CompanyRetrievalService();
    }
    return CompanyRetrievalService.instance;
  }

  public async getCompaniesByAccess(
    hasAccess: boolean
  ): Promise<CompaniesRetrievalResponse> {
    try {
      const companies = await this.companyRepository.getCompaniesByAccess(
        hasAccess
      );

      if (companies && companies.length >= 0) {
        const mappedData = companies.map((company) => ({
          id: company.id,
          name: company.name,
          email: company.email ?? undefined,
          phone: company.phone ?? undefined,
          hasAccess: company.hasAccess ?? false,
        }));

        return { success: true, data: mappedData };
      } else {
        return { success: false, error: "No companies found" };
      }
    } catch (error) {
      return { success: false, error: "Failed to retrieve companies" };
    }
  }
}

export { CompanyRetrievalService };
