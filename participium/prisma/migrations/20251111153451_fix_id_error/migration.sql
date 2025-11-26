/*
  Warnings:

  - The primary key for the `Photo` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Photo_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Photo_id_seq";
