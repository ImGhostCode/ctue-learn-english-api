/*
  Warnings:

  - You are about to drop the `phoneticProEval` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userLearndSentences` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userLearndWords` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "phoneticProEval" DROP CONSTRAINT "phoneticProEval_userId_fkey";

-- DropForeignKey
ALTER TABLE "userLearndSentences" DROP CONSTRAINT "userLearndSentences_sentence_id_fkey";

-- DropForeignKey
ALTER TABLE "userLearndSentences" DROP CONSTRAINT "userLearndSentences_user_id_fkey";

-- DropForeignKey
ALTER TABLE "userLearndWords" DROP CONSTRAINT "userLearndWords_user_id_fkey";

-- DropForeignKey
ALTER TABLE "userLearndWords" DROP CONSTRAINT "userLearndWords_word_id_fkey";

-- DropTable
DROP TABLE "phoneticProEval";

-- DropTable
DROP TABLE "userLearndSentences";

-- DropTable
DROP TABLE "userLearndWords";

-- CreateTable
CREATE TABLE "pronunciationAssessment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "score" INTEGER NOT NULL,

    CONSTRAINT "pronunciationAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phonemeAssessments" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "pronunciationAssessment" INTEGER NOT NULL,

    CONSTRAINT "phonemeAssessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userLearnedWords" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "wordId" INTEGER NOT NULL,
    "setId" INTEGER NOT NULL,
    "memoryLevel" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userLearnedWords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabularySets" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vocabularySets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_VocabularySetToWord" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_VocabularySetToWord_AB_unique" ON "_VocabularySetToWord"("A", "B");

-- CreateIndex
CREATE INDEX "_VocabularySetToWord_B_index" ON "_VocabularySetToWord"("B");

-- AddForeignKey
ALTER TABLE "pronunciationAssessment" ADD CONSTRAINT "pronunciationAssessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phonemeAssessments" ADD CONSTRAINT "phonemeAssessments_pronunciationAssessment_fkey" FOREIGN KEY ("pronunciationAssessment") REFERENCES "pronunciationAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userLearnedWords" ADD CONSTRAINT "userLearnedWords_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userLearnedWords" ADD CONSTRAINT "userLearnedWords_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userLearnedWords" ADD CONSTRAINT "userLearnedWords_setId_fkey" FOREIGN KEY ("setId") REFERENCES "vocabularySets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabularySets" ADD CONSTRAINT "vocabularySets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VocabularySetToWord" ADD CONSTRAINT "_VocabularySetToWord_A_fkey" FOREIGN KEY ("A") REFERENCES "vocabularySets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VocabularySetToWord" ADD CONSTRAINT "_VocabularySetToWord_B_fkey" FOREIGN KEY ("B") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;
