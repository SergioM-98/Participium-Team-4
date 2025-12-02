import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env from root folder
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// During tests, use the DATABASE_URL from environment (set by test:setup)
// During production/dev, use the default PrismaClient initialization
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
    datasourceUrl: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
