import bcrypt from "bcrypt";
import { prisma } from "@/prisma/db";

export default async function createAdmin() {
    const existing = await prisma.user.findUnique({
        where: { username: "admin" },
    });

    if (existing) {
        console.log("Admin already exists. Skipping creation.");
        return;
    }
    const id = crypto.randomUUID();
    const password = "adminTeam4";
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log("Hashed password:", hashedPassword);

    await prisma.user.create({
        data: {
        id: id as string,
        username: "admin",
        passwordHash: hashedPassword,
        firstName: "admin",
        lastName: "admin",
        role: "ADMIN" as const,
        },
    });

    console.log("Admin created successfully!");
}
