-- CreateTable
CREATE TABLE "notifications_preferences" (
    "id" BIGINT NOT NULL,
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
    "userId" BIGINT,

    CONSTRAINT "profile_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_photos_userId_key" ON "profile_photos"("userId");

-- AddForeignKey
ALTER TABLE "notifications_preferences" ADD CONSTRAINT "notifications_preferences_id_fkey" FOREIGN KEY ("id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_photos" ADD CONSTRAINT "profile_photos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
