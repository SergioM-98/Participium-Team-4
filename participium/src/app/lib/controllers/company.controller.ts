"use server";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { CompanyCreationService } from "@/services/companyCreation.service";
import { Company } from "@prisma/client";
import { CompanyRetrievalService } from "@/services/companyRetrieval.service";
import { CompaniesRetrievalResponse } from "@/dtos/company.dto";

export async function createCompany(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized access" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const hasAccess = formData.get("hasAccess") === "true";

  const company: Partial<Company> = {
    name,
    email,
    phone: phone || undefined,
    hasAccess,
  };

  const companyService = CompanyCreationService.getInstance();
  return await companyService.createCompany(company);
}

export async function getCompaniesByAccess(hasAccess: boolean): Promise<CompaniesRetrievalResponse> {
  const companyService = CompanyRetrievalService.getInstance();
  return await companyService.getCompaniesByAccess(hasAccess);
}

export async function getAllCompanies(): Promise<CompaniesRetrievalResponse> {
  const companyService = CompanyRetrievalService.getInstance();

  const companiesWithAccess = await companyService.getCompaniesByAccess(true);
  const companiesWithoutAccess = await companyService.getCompaniesByAccess(false);

  if (!companiesWithAccess.success || !companiesWithoutAccess.success) {
    return { success: false, error: "No companies found" };
  }
  
  const combinedData = [
    ...(companiesWithAccess.data || []),
    ...(companiesWithoutAccess.data || []),
  ];
  
  return { success: true, data: combinedData };
}
