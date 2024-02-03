/*
  Warnings:

  - You are about to drop the column `setId` on the `userLearnedWords` table. All the data in the column will be lost.
  - Added the required column `userVocabularySetId` to the `userLearnedWords` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "userLearnedWords" DROP CONSTRAINT "userLearnedWords_setId_fkey";

-- AlterTable
ALTER TABLE "userLearnedWords" DROP COLUMN "setId",
ADD COLUMN     "userVocabularySetId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "userVocabularySets" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "vocabularySetId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "userVocabularySets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "userLearnedWords" ADD CONSTRAINT "userLearnedWords_userVocabularySetId_fkey" FOREIGN KEY ("userVocabularySetId") REFERENCES "userVocabularySets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userVocabularySets" ADD CONSTRAINT "userVocabularySets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userVocabularySets" ADD CONSTRAINT "userVocabularySets_vocabularySetId_fkey" FOREIGN KEY ("vocabularySetId") REFERENCES "vocabularySets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
