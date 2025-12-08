/*
  Warnings:

  - Changed the column `office` on the `user` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.

*/
-- AlterTable
-- Step 1: Create a temporary column to hold the array values
ALTER TABLE "user" ADD COLUMN "office_temp" "Offices"[];

-- Step 2: Convert existing single values to arrays
UPDATE "user" SET "office_temp" = ARRAY["office"]::"Offices"[] WHERE "office" IS NOT NULL;
UPDATE "user" SET "office_temp" = ARRAY[]::"Offices"[] WHERE "office" IS NULL;

-- Step 3: Drop the old column
ALTER TABLE "user" DROP COLUMN "office";

-- Step 4: Rename temp column to office
ALTER TABLE "user" RENAME COLUMN "office_temp" TO "office";

-- Step 5: Set default value
ALTER TABLE "user" ALTER COLUMN "office" SET DEFAULT ARRAY[]::"Offices"[];

