import { prisma } from "../../../../prisma/db";

class CompanyRepository {
  private static instance: CompanyRepository;

  private constructor() {}

  public static getInstance(): CompanyRepository {
    if (!CompanyRepository.instance) {
      CompanyRepository.instance = new CompanyRepository();
    }
    return CompanyRepository.instance;
  }

  public async createCompany(companyData: {
    name: string;
    email: string;
    phone?: string | null;
    hasAccess?: boolean;
  }) {
    const data: any = {
      name: companyData.name,
      email: companyData.email,
      hasAccess: companyData.hasAccess ?? false,
    };

    if (companyData.phone !== undefined && companyData.phone !== null) {
      data.phone = companyData.phone;
    }

    return await prisma.company.create({ data });
  }

  public async getCompaniesByAccess(hasAccess: boolean) {
    return await prisma.company.findMany({
      where: {
        hasAccess: hasAccess,
      },
    });
  }
}

export { CompanyRepository };
