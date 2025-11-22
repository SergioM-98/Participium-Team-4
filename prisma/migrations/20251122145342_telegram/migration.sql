/*
  Warnings:

  - The primary key for the `notifications_preferences` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_citizenId_fkey";

-- DropForeignKey
ALTER TABLE "notifications_preferences" DROP CONSTRAINT "notifications_preferences_id_fkey";

-- DropForeignKey
ALTER TABLE "profile_photos" DROP CONSTRAINT "profile_photos_userId_fkey";

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "citizenId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "notifications_preferences" DROP CONSTRAINT "notifications_preferences_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "notifications_preferences_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "profile_photos" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "user" DROP CONSTRAINT "user_pkey",
ADD COLUMN     "telegramRequestPending" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_id_seq";

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications_preferences" ADD CONSTRAINT "notifications_preferences_id_fkey" FOREIGN KEY ("id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_photos" ADD CONSTRAINT "profile_photos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
