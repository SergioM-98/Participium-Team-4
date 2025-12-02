import bcrypt from "bcrypt";
import { prisma } from "./db";

export default async function createPublicRelationsOfficer() {
  const existing = await prisma.user.findUnique({
    where: { username: "arossi" },
  });

  if (existing) {
    console.log("Public Relations Officer already exists. Skipping creation.");
    return;
  }

  const id = crypto.randomUUID();
  const password = "PrOfficerTeam4";
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  console.log("Hashed password:", hashedPassword);

  await prisma.user.create({
    data: {
      id: id as string,
      username: "arossi",
      passwordHash: hashedPassword,
      firstName: "Antonio",
      lastName: "Rossi",
      email: "arossi@team4.it",
      role: "PUBLIC_RELATIONS_OFFICER" as const,
      office: "DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES",
    },
  });

  console.log("Public Relations Officer created successfully!");
}
