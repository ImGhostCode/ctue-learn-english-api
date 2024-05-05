-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_sentenceId_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_wordId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "pronunciationAssessments" DROP CONSTRAINT "pronunciationAssessments_userId_fkey";

-- DropForeignKey
ALTER TABLE "reviewReminders" DROP CONSTRAINT "reviewReminders_userId_fkey";

-- DropForeignKey
ALTER TABLE "userVocabularyPacks" DROP CONSTRAINT "userVocabularyPacks_userId_fkey";

-- DropForeignKey
ALTER TABLE "userVocabularyPacks" DROP CONSTRAINT "userVocabularyPacks_vocabularyPackId_fkey";

-- DropForeignKey
ALTER TABLE "vocabularyPacks" DROP CONSTRAINT "vocabularyPacks_userId_fkey";

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_sentenceId_fkey" FOREIGN KEY ("sentenceId") REFERENCES "sentences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pronunciationAssessments" ADD CONSTRAINT "pronunciationAssessments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabularyPacks" ADD CONSTRAINT "vocabularyPacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userVocabularyPacks" ADD CONSTRAINT "userVocabularyPacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userVocabularyPacks" ADD CONSTRAINT "userVocabularyPacks_vocabularyPackId_fkey" FOREIGN KEY ("vocabularyPackId") REFERENCES "vocabularyPacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviewReminders" ADD CONSTRAINT "reviewReminders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
