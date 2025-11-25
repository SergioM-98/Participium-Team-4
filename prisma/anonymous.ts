import bcrypt from "bcrypt";
import { prisma } from "@/prisma/db";

export default async function createAnonymous() {
    const existing = await prisma.user.findUnique({
        where: { username: "Anonymous" },
    });

    if (existing) {
        console.log("Anonymous user already exists. Skipping creation.");
        return;
    }

    const password = "an";
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log("Hashed password:", hashedPassword);

    await prisma.user.create({
        data: {
        id: "2",
        username: "Anonymous",
        passwordHash: hashedPassword,
        firstName: "Anonymous",
        lastName: "User",
        role: "CITIZEN",
        },
    });

    console.log("Anonymous user created successfully!");
}