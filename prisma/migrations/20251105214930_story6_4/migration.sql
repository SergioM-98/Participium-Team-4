/*
  Warnings:

  - Changed the type of `name` on the `department` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."report" DROP CONSTRAINT "report_assignedDepartment_fkey";

-- AlterTable
ALTER TABLE "department" DROP COLUMN "name",
ADD COLUMN     "name" "Category" NOT NULL;

-- AlterTable
ALTER TABLE "report" ALTER COLUMN "assignedDepartment" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_assignedDepartment_fkey" FOREIGN KEY ("assignedDepartment") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
