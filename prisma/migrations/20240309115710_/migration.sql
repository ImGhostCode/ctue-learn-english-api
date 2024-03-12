/*
  Warnings:

  - The primary key for the `userLearnedWords` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userVocabularySetId` on the `userLearnedWords` table. All the data in the column will be lost.
  - Added the required column `vocabularySetId` to the `userLearnedWords` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "userLearnedWords" DROP CONSTRAINT "userLearnedWords_userId_userVocabularySetId_fkey";

-- AlterTable
ALTER TABLE "userLearnedWords" DROP CONSTRAINT "userLearnedWords_pkey",
DROP COLUMN "userVocabularySetId",
ADD COLUMN     "userVocabularySetUserId" INTEGER,
ADD COLUMN     "userVocabularySetVocabularySetId" INTEGER,
ADD COLUMN     "vocabularySetId" INTEGER NOT NULL,
ADD CONSTRAINT "userLearnedWords_pkey" PRIMARY KEY ("userId", "wordId", "vocabularySetId");

-- AddForeignKey
ALTER TABLE "userLearnedWords" ADD CONSTRAINT "userLearnedWords_vocabularySetId_fkey" FOREIGN KEY ("vocabularySetId") REFERENCES "vocabularySets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userLearnedWords" ADD CONSTRAINT "userLearnedWords_userVocabularySetUserId_userVocabularySet_fkey" FOREIGN KEY ("userVocabularySetUserId", "userVocabularySetVocabularySetId") REFERENCES "userVocabularySets"("userId", "vocabularySetId") ON DELETE SET NULL ON UPDATE CASCADE;
