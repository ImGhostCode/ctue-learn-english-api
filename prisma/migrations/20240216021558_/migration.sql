/*
  Warnings:

  - The primary key for the `userLearnedWords` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `userLearnedWords` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "userLearnedWords" DROP CONSTRAINT "userLearnedWords_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "userLearnedWords_pkey" PRIMARY KEY ("userId", "wordId", "userVocabularySetId");
