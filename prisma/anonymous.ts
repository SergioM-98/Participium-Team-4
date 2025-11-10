import bcrypt from "bcrypt";
import { prisma } from "./db";

export default async function createAdmin() {
    const existing = await prisma.user.findUnique({
        where: { username: "Anonymous" },
    });

    if (existing) {
        console.log("Admin already exists. Skipping creation.");
        return;
    }

    const password = "an";
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log("Hashed password:", hashedPassword);

    await prisma.user.create({
        data: {
        username: "Anonymous",
        passwordHash: hashedPassword,
        firstName: "Anonymous",
        lastName: "User",
        role: "CITIZEN",
        },
    });

    console.log("Anonymous user created successfully!");
}