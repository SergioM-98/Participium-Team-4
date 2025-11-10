/*
  Warnings:

  - You are about to drop the `citizen` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "citizen";

-- CreateTable
CREATE TABLE "user" (
    "id" BIGSERIAL NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100),
    "username" VARCHAR(100) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CITIZEN',
    "office" "Category",
    "passwordHash" VARCHAR(255) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");
