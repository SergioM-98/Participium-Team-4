/*
  Warnings:

  - The values [OFFICER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `notifications_preferences` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'TECHNICAL_OFFICER', 'PUBLIC_RELATIONS_OFFICER', 'CITIZEN');
ALTER TABLE "public"."user" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'CITIZEN';
COMMIT;

-- DropForeignKey
ALTER TABLE "notifications_preferences" DROP CONSTRAINT "notifications_preferences_id_fkey";

-- DropForeignKey
ALTER TABLE "profile_photos" DROP CONSTRAINT "profile_photos_userId_fkey";

-- DropForeignKey
ALTER TABLE "report" DROP CONSTRAINT "report_citizenId_fkey";

-- DropForeignKey
ALTER TABLE "report" DROP CONSTRAINT "report_officerId_fkey";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_recipientId_fkey";

-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_authorId_fkey";

-- AlterTable
ALTER TABLE "notifications_preferences" DROP CONSTRAINT "notifications_preferences_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "notifications_preferences_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "profile_photos" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "notification" ALTER COLUMN "recipientId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "message" ALTER COLUMN "authorId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "report" ALTER COLUMN "citizenId" SET DATA TYPE TEXT,
ALTER COLUMN "officerId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "user" DROP CONSTRAINT "user_pkey",
ADD COLUMN     "telegramRequestPending" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_id_seq";

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications_preferences" ADD CONSTRAINT "notifications_preferences_id_fkey" FOREIGN KEY ("id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_photos" ADD CONSTRAINT "profile_photos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
