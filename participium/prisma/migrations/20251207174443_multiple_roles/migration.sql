/*
  Warnings:

  - Changed the column `role` on the `user` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.
*/
-- AlterTable
ALTER TABLE "user"
  ALTER COLUMN "role" DROP DEFAULT,
  ALTER COLUMN "role" SET DATA TYPE "Role"[] USING ARRAY["role"],
  ALTER COLUMN "role" SET DEFAULT ARRAY['CITIZEN']::"Role"[];
