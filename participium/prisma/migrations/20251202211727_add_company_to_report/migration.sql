-- AlterTable
ALTER TABLE "report" ADD COLUMN     "companyId" TEXT;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
