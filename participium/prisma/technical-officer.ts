import bcrypt from "bcrypt";
import { prisma } from "./db";

export default async function createTechnicalOfficer() {
  const existing = await prisma.user.findUnique({
    where: { username: "mcurie" },
  });

  if (existing) {
    console.log("Technical Officer already exists. Skipping creation.");
    return;
  }

  const id = crypto.randomUUID();
  const password = "tOfficerTeam4";
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  console.log("Hashed password:", hashedPassword);

  await prisma.user.create({
    data: {
      id: id as string,
      username: "mcurie",
      passwordHash: hashedPassword,
      firstName: "Marie",
      lastName: "Curie",
      email: "mcurie@team4.it",
      role: "TECHNICAL_OFFICER" as const,
      office: "DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES",
    },
  });

  console.log("Technical Officer created successfully!");
}
