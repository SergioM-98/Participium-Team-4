-- DropForeignKey
ALTER TABLE "notifications_preferences" DROP CONSTRAINT "notifications_preferences_id_fkey";

-- AddForeignKey
ALTER TABLE "notifications_preferences" ADD CONSTRAINT "notifications_preferences_id_fkey" FOREIGN KEY ("id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
