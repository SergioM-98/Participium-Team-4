-- CreateEnum
CREATE TYPE "Category" AS ENUM ('WATER_SUPPLY', 'ARCHITECTURAL_BARRIERS', 'SEWER_SYSTEM', 'PUBLIC_LIGHTING', 'WASTE', 'ROADS_SIGNS_AND_TRAFFIC_LIGHTS', 'ROADS_AND_URBAN_FURNISHINGS', 'PUBLIC_GREEN_AREAS_AND_BACKGROUNDS', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING_APPROVAL', 'ASSIGNED', 'IN_PROGRESS', 'SUSPENDED', 'REJECTED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TECHNICAL_OFFICER', 'PUBLIC_RELATIONS_OFFICER', 'CITIZEN');

-- CreateEnum
CREATE TYPE "Offices" AS ENUM ('DEPARTMENT_OF_COMMERCE', 'DEPARTMENT_OF_EDUCATIONAL_SERVICES', 'DEPARTMENT_OF_DECENTRALIZATION_AND_CIVIC_SERVICES', 'DEPARTMENT_OF_SOCIAL_HEALTH_AND_HOUSING_SERVICES', 'DEPARTMENT_OF_INTERNAL_SERVICES', 'DEPARTMENT_OF_CULTURE_SPORT_MAJOR_EVENTS_AND_TOURISM_PROMOTION', 'DEPARTMENT_OF_FINANCIAL_RESOURCES', 'DEPARTMENT_OF_GENERAL_SERVICES_PROCUREMENT_AND_SUPPLIES', 'DEPARTMENT_OF_MAINTENANCE_AND_TECHNICAL_SERVICES', 'DEPARTMENT_OF_URBAN_PLANNING_AND_PRIVATE_BUILDING', 'DEPARTMENT_OF_ENVIRONMENT_MAJOR_PROJECTS_INFRAS_AND_MOBILITY', 'DEPARTMENT_OF_LOCAL_POLICE', 'OTHER');

-- CreateTable
CREATE TABLE "report" (
    "id" BIGSERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "category" "Category" NOT NULL DEFAULT 'OTHER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "longitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "citizenId" TEXT NOT NULL,
    "officerId" TEXT,
    "rejectionReason" TEXT,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" BIGINT NOT NULL DEFAULT 0,
    "offset" BIGINT NOT NULL DEFAULT 0,
    "filename" TEXT,
    "reportId" BIGINT,

    CONSTRAINT "photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100),
    "username" VARCHAR(100) NOT NULL,
    "telegram" VARCHAR(100),
    "telegramRequestPending" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'CITIZEN',
    "office" "Offices",
    "passwordHash" VARCHAR(255) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications_preferences" (
    "id" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "telegramEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notifications_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_photos" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" BIGINT NOT NULL DEFAULT 0,
    "offset" BIGINT NOT NULL DEFAULT 0,
    "filename" TEXT,
    "userId" TEXT,

    CONSTRAINT "profile_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_telegram_key" ON "user"("telegram");

-- CreateIndex
CREATE UNIQUE INDEX "profile_photos_userId_key" ON "profile_photos"("userId");

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications_preferences" ADD CONSTRAINT "notifications_preferences_id_fkey" FOREIGN KEY ("id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_photos" ADD CONSTRAINT "profile_photos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
