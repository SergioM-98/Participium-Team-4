/*
  Warnings:

  - You are about to drop the `Photo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_reportId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_citizenId_fkey";

-- DropTable
DROP TABLE "Photo";

-- DropTable
DROP TABLE "Report";

-- CreateTable
CREATE TABLE "report" (
    "id" BIGSERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "category" "Category" NOT NULL DEFAULT 'OTHER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "longitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "citizenId" BIGINT NOT NULL,
    "officerId" BIGINT,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" BIGINT NOT NULL DEFAULT 0,
    "offset" BIGINT NOT NULL DEFAULT 0,
    "filename" TEXT,
    "reportId" BIGINT,

    CONSTRAINT "photo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE SET NULL ON UPDATE CASCADE;
