-- AlterTable
ALTER TABLE "report" ADD COLUMN     "maintainerId" TEXT;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_maintainerId_fkey" FOREIGN KEY ("maintainerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
