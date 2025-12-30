import bcrypt from "bcrypt";
import { prisma } from "./db";

export default async function createExternalMaintainerWithoutAccess() {
  const existingCompany = await prisma.company.findFirst({
    where: { email: "bianchi-solutions@team4.it" },
  });

  let companyId: string;

  if (existingCompany) {
    companyId = existingCompany.id;
    console.log("Company already exists. Using existing company.");
  } else {
    const company = await prisma.company.create({
      data: {
        name: "Bianchi Solutions Ltd",
        email: "bianchi-solutions@team4.it",
        phone: "+39 987 654 3210",
        hasAccess: false,
      },
    });
    companyId = company.id;
    console.log("Company created successfully!");
  }

  const existing = await prisma.user.findUnique({
    where: { username: "gbianchi" },
  });

  if (existing) {
    console.log(
      "External Maintainer Without Access already exists. Skipping creation."
    );
    return;
  }

  const id = crypto.randomUUID();
  const password = "extMaintWithoutTeam4";
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  console.log("Hashed password:", hashedPassword);

  await prisma.user.create({
    data: {
      id: id,
      username: "gbianchi",
      passwordHash: hashedPassword,
      firstName: "Giovanni",
      lastName: "Bianchi",
      email: "gbianchi@team4.it",
      role: ["EXTERNAL_MAINTAINER_WITH_ACCESS" as const],
      companyId: companyId,
    },
  });

  console.log("External Maintainer Without Access created successfully!");
}
