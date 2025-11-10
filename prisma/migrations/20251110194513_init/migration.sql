/*
  Warnings:

  - You are about to drop the column `userId` on the `Report` table. All the data in the column will be lost.
  - The `office` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[telegram]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `citizenId` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Offices" AS ENUM ('DEPARTMENT_OF_COMMERCE', 'DEPARTMENT_OF_EDUCATIONAL_SERVICES', 'DEPARTMENT_OF_DECENTRALIZATION_AND_CIVIC_SERVICES', 'DEPARTMENT_OF_SOCIAL_HEALTH_AND_HOUSING_SERVICES', 'DEPARTMENT_OF_INTERNAL_SERVICES', 'DEPARTMENT_OF_CULTURE_SPORT_MAJOR_EVENTS_AND_TOURISM_PROMOTION', 'DEPARTMENT_OF_FINANCIAL_RESOURCES', 'DEPARTMENT_OF_GENERAL_SERVICES_PROCUREMENT_AND_SUPPLIES', 'DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES', 'DEPARTMENT_OF_URBAN_PLANNING_AND_PRIVATE_BUILDING', 'DEPARTMENT_OF_ENVIRONMENT_MAJOR_PROJECTS_INFRAS_AND_MOBILITY', 'DEPARTMENT_OF_LOCAL_POLICE', 'OTHER');

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "userId",
ADD COLUMN     "citizenId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "telegram" VARCHAR(100),
DROP COLUMN "office",
ADD COLUMN     "office" "Offices";

-- CreateIndex
CREATE UNIQUE INDEX "user_telegram_key" ON "user"("telegram");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
