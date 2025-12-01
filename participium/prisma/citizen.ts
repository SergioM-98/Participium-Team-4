import bcrypt from "bcrypt";
import { prisma } from "./db";

export default async function createCitizen() {
  const existing = await prisma.user.findUnique({
    where: { username: "mneri" },
  });

  if (existing) {
    console.log("Citizen already exists. Skipping creation.");
    return;
  }

  const id = crypto.randomUUID();
  const password = "citizenTeam4";
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  console.log("Hashed password:", hashedPassword);

  await prisma.user.create({
    data: {
      id: id as string,
      username: "mneri",
      passwordHash: hashedPassword,
      firstName: "Marco",
      lastName: "Neri",
      email: "mneri@team4.it",
      role: "CITIZEN" as const,
      telegram: "",
      notificationPreferences: {
        create: {
          emailEnabled: true,
          telegramEnabled: false,
        },
      },
    },
  });

  console.log("Citizen created successfully!");
}
