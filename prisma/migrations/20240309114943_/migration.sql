-- DropForeignKey
ALTER TABLE "reviewReminders" DROP CONSTRAINT "reviewReminders_userId_vocabularySetId_fkey";

-- AddForeignKey
ALTER TABLE "reviewReminders" ADD CONSTRAINT "reviewReminders_vocabularySetId_fkey" FOREIGN KEY ("vocabularySetId") REFERENCES "vocabularySets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
