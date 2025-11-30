"use server";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { CompanyCreationService } from "@/services/companyCreation.service";
import { Company } from "@prisma/client";
import { CompanyRetrievalService } from "@/services/companyRetrieval.service";

export async function createCompany(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
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

export async function getCompaniesByAccess(hasAccess: boolean) {
  const companyService = CompanyRetrievalService.getInstance();
  return await companyService.getCompaniesByAccess(hasAccess);
}
