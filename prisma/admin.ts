import bcrypt from "bcrypt";
import { prisma } from "./db";

export default async function createAdmin() {
    const existing = await prisma.user.findUnique({
        where: { username: "admin" },
    });

    if (existing) {
        console.log("Admin already exists. Skipping creation.");
        return;
    }

    const password = "adminTeam4";
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log("Hashed password:", hashedPassword);

    await prisma.user.create({
        data: {
        username: "admin",
        passwordHash: hashedPassword,
        firstName: "admin",
        lastName: "admin",
        role: "ADMIN",
        },
    });

    console.log("Admin created successfully!");
}
