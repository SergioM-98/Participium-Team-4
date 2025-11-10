/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Report` table. All the data in the column will be lost.
  - Added the required column `latitude` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('WATER_SUPPLY', 'ARCHITECTURAL_BARRIERS', 'SEWER_SYSTEM', 'PUBLIC_LIGHTING', 'WASTE', 'ROADS_SIGNS_AND_TRAFFIC_LIGHTS', 'ROADS_AND_URBAN_FURNISHINGS', 'PUBLIC_GREEN_AREAS_AND_BACKGROUNDS', 'OTHER');

-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_reportId_fkey";

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "filename" TEXT,
ADD COLUMN     "offset" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "size" BIGINT NOT NULL DEFAULT 0,
ALTER COLUMN "reportId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "updatedAt",
ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;
