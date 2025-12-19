/*
  Warnings:

  - The values [EXTERNAL_MAINTAINER_WITHOUT_ACCESS] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'TECHNICAL_OFFICER', 'PUBLIC_RELATIONS_OFFICER', 'EXTERNAL_MAINTAINER_WITH_ACCESS', 'CITIZEN');
ALTER TABLE "public"."user" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "role" TYPE "Role_new"[] USING ("role"::text::"Role_new"[]);
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT ARRAY['CITIZEN']::"Role"[];
COMMIT;
