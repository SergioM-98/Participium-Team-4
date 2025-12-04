-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.

-- DropForeignKey (solo se esiste)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'notifications_preferences_id_fkey'
    ) THEN
        ALTER TABLE "notifications_preferences" DROP CONSTRAINT "notifications_preferences_id_fkey";
    END IF;
END $$;

-- AlterTable (aggiungi colonne solo se non esistono)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user' AND column_name = 'companyId'
    ) THEN
        ALTER TABLE "user" ADD COLUMN "companyId" TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user' AND column_name = 'isVerified'
    ) THEN
        ALTER TABLE "user" ADD COLUMN "isVerified" BOOLEAN;
    END IF;
END $$;

-- CreateTable verification_token (solo se non esiste)
CREATE TABLE IF NOT EXISTS "verification_token" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "verification_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable company (solo se non esiste)
CREATE TABLE IF NOT EXISTS "company" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "hasAccess" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey (solo se non esiste)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_companyId_fkey'
    ) THEN
        ALTER TABLE "user" ADD CONSTRAINT "user_companyId_fkey" 
        FOREIGN KEY ("companyId") REFERENCES "company"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'verification_token_userId_fkey'
    ) THEN
        ALTER TABLE "verification_token" ADD CONSTRAINT "verification_token_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "user"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'notifications_preferences_id_fkey'
    ) THEN
        ALTER TABLE "notifications_preferences" ADD CONSTRAINT "notifications_preferences_id_fkey" 
        FOREIGN KEY ("id") REFERENCES "user"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
