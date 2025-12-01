import bcrypt from "bcrypt";
import { prisma } from "./db";

export default async function createExternalMaintainerWithAccess() {
  const existingCompany = await prisma.company.findFirst({
    where: { email: "verdi-maintenance@team4.it" },
  });

  let companyId: string;

  if (!existingCompany) {
    const company = await prisma.company.create({
      data: {
        name: "Verdi Maintenance Services",
        email: "verdi-maintenance@team4.it",
        phone: "+39 123 456 7890",
        hasAccess: true,
      },
    });
    companyId = company.id;
    console.log("Company created successfully!");
  } else {
    companyId = existingCompany.id;
    console.log("Company already exists. Using existing company.");
  }

  const existing = await prisma.user.findUnique({
    where: { username: "everdi" },
  });

  if (existing) {
    console.log(
      "External Maintainer With Access already exists. Skipping creation."
    );
    return;
  }

  const id = crypto.randomUUID();
  const password = "externalMaintainerWithAccessTeam4";
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  console.log("Hashed password:", hashedPassword);

  await prisma.user.create({
    data: {
      id: id as string,
      username: "everdi",
      passwordHash: hashedPassword,
      firstName: "Emma",
      lastName: "Verdi",
      email: "everdi@team4.it",
      role: "EXTERNAL_MAINTAINER_WITH_ACCESS" as const,
      companyId: companyId,
    },
  });

  console.log("External Maintainer With Access created successfully!");
}
