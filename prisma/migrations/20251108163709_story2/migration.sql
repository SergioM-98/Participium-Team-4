-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OFFICER', 'CITIZEN');

-- AlterTable
ALTER TABLE "citizen" ADD COLUMN     "office" "Category",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'CITIZEN',
ALTER COLUMN "email" DROP NOT NULL;
