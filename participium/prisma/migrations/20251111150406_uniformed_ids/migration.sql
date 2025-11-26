/*
  Warnings:

  - The primary key for the `Photo` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Photo` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `reportId` column on the `Photo` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Report` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Report` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_reportId_fkey";

-- AlterTable
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "reportId",
ADD COLUMN     "reportId" BIGINT,
ADD CONSTRAINT "Photo_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Report" DROP CONSTRAINT "Report_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ADD CONSTRAINT "Report_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;
