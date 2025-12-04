/*
  Warnings:

  - You are about to drop the column `telegram` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[telegramChatId]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[telegramToken]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "user_telegram_key";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "telegram",
ADD COLUMN     "telegramChatId" VARCHAR(100),
ADD COLUMN     "telegramRequestTTL" TIMESTAMP(3),
ADD COLUMN     "telegramToken" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "user_telegramChatId_key" ON "user"("telegramChatId");

-- CreateIndex
CREATE UNIQUE INDEX "user_telegramToken_key" ON "user"("telegramToken");
