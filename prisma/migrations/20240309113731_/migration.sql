/*
  Warnings:

  - You are about to drop the column `userVocabularySetId` on the `reviewReminders` table. All the data in the column will be lost.
  - The primary key for the `userVocabularySets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `userVocabularySets` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,vocabularySetId]` on the table `userVocabularySets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `vocabularySetId` to the `reviewReminders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "reviewReminders" DROP CONSTRAINT "reviewReminders_userVocabularySetId_fkey";

-- DropForeignKey
ALTER TABLE "userLearnedWords" DROP CONSTRAINT "userLearnedWords_userVocabularySetId_fkey";

-- AlterTable
ALTER TABLE "reviewReminders" DROP COLUMN "userVocabularySetId",
ADD COLUMN     "vocabularySetId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "userVocabularySets" DROP CONSTRAINT "userVocabularySets_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "userVocabularySets_pkey" PRIMARY KEY ("userId", "vocabularySetId");

-- CreateIndex
CREATE UNIQUE INDEX "userVocabularySets_userId_vocabularySetId_key" ON "userVocabularySets"("userId", "vocabularySetId");

-- AddForeignKey
ALTER TABLE "userLearnedWords" ADD CONSTRAINT "userLearnedWords_userId_userVocabularySetId_fkey" FOREIGN KEY ("userId", "userVocabularySetId") REFERENCES "userVocabularySets"("userId", "vocabularySetId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviewReminders" ADD CONSTRAINT "reviewReminders_userId_vocabularySetId_fkey" FOREIGN KEY ("userId", "vocabularySetId") REFERENCES "userVocabularySets"("userId", "vocabularySetId") ON DELETE RESTRICT ON UPDATE CASCADE;
