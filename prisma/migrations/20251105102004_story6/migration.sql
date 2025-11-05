/*
  Warnings:

  - You are about to drop the `role_permission` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[telegram]` on the table `citizen` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `departmentId` to the `municipality_user` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Decision" AS ENUM ('APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('WATER_SUPPLY', 'ARCHITECTURAL_BARRIERS', 'SEWER_SYSTEM', 'PUBLIC_LIGHTING', 'WASTE', 'ROADS_SIGNS_AND_TRAFFIC_LIGHTS', 'ROADS_AND_URBAN_FURNISHINGS', 'PUBLIC_GREEN_AREAS_AND_BACKGROUNDS', 'OTHER');

-- DropForeignKey
ALTER TABLE "public"."role_permission" DROP CONSTRAINT "role_permission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."role_permission" DROP CONSTRAINT "role_permission_roleId_fkey";

-- AlterTable
ALTER TABLE "citizen" ADD COLUMN     "telegram" VARCHAR(100);

-- AlterTable
ALTER TABLE "municipality_user" ADD COLUMN     "departmentId" BIGINT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMPTZ(6);

-- DropTable
DROP TABLE "public"."role_permission";

-- CreateTable
CREATE TABLE "department" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address" (
    "id" BIGSERIAL NOT NULL,
    "streetName" VARCHAR(200) NOT NULL,
    "postalCode" VARCHAR(20) NOT NULL,
    "number" BIGINT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "category" "Category" NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "decision" "Decision" NOT NULL,
    "explaination" VARCHAR(500) NOT NULL,
    "createdBy" BIGINT NOT NULL,
    "assignmentDate" TIMESTAMPTZ(6),
    "assignedEmployee" BIGINT,
    "assignedDepartment" BIGINT NOT NULL,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo" (
    "id" BIGSERIAL NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "reportId" BIGINT NOT NULL,

    CONSTRAINT "photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL,

    CONSTRAINT "_PermissionToRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AddressToDepartment" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL,

    CONSTRAINT "_AddressToDepartment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- CreateIndex
CREATE INDEX "_AddressToDepartment_B_index" ON "_AddressToDepartment"("B");

-- CreateIndex
CREATE UNIQUE INDEX "citizen_telegram_key" ON "citizen"("telegram");

-- AddForeignKey
ALTER TABLE "municipality_user" ADD CONSTRAINT "municipality_user_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "citizen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_assignedEmployee_fkey" FOREIGN KEY ("assignedEmployee") REFERENCES "municipality_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_assignedDepartment_fkey" FOREIGN KEY ("assignedDepartment") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AddressToDepartment" ADD CONSTRAINT "_AddressToDepartment_A_fkey" FOREIGN KEY ("A") REFERENCES "address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AddressToDepartment" ADD CONSTRAINT "_AddressToDepartment_B_fkey" FOREIGN KEY ("B") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
