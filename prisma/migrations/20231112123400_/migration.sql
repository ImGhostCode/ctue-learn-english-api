/*
  Warnings:

  - You are about to drop the column `practiceId` on the `sentences` table. All the data in the column will be lost.
  - You are about to drop the column `practiceId` on the `words` table. All the data in the column will be lost.
  - Added the required column `numOfSentence` to the `practices` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "sentences" DROP CONSTRAINT "sentences_practiceId_fkey";

-- DropForeignKey
ALTER TABLE "words" DROP CONSTRAINT "words_practiceId_fkey";

-- AlterTable
ALTER TABLE "practices" ADD COLUMN     "levelId" INTEGER,
ADD COLUMN     "numOfSentence" INTEGER NOT NULL,
ADD COLUMN     "specializationId" INTEGER,
ADD COLUMN     "typeId" INTEGER;

-- AlterTable
ALTER TABLE "sentences" DROP COLUMN "practiceId";

-- AlterTable
ALTER TABLE "words" DROP COLUMN "practiceId";

-- CreateTable
CREATE TABLE "highScores" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "highScores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PracticeToWord" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_PracticeToSentence" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_PracticeToTopic" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PracticeToWord_AB_unique" ON "_PracticeToWord"("A", "B");

-- CreateIndex
CREATE INDEX "_PracticeToWord_B_index" ON "_PracticeToWord"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PracticeToSentence_AB_unique" ON "_PracticeToSentence"("A", "B");

-- CreateIndex
CREATE INDEX "_PracticeToSentence_B_index" ON "_PracticeToSentence"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PracticeToTopic_AB_unique" ON "_PracticeToTopic"("A", "B");

-- CreateIndex
CREATE INDEX "_PracticeToTopic_B_index" ON "_PracticeToTopic"("B");

-- AddForeignKey
ALTER TABLE "highScores" ADD CONSTRAINT "highScores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practices" ADD CONSTRAINT "practices_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practices" ADD CONSTRAINT "practices_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practices" ADD CONSTRAINT "practices_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "specializations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PracticeToWord" ADD CONSTRAINT "_PracticeToWord_A_fkey" FOREIGN KEY ("A") REFERENCES "practices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PracticeToWord" ADD CONSTRAINT "_PracticeToWord_B_fkey" FOREIGN KEY ("B") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PracticeToSentence" ADD CONSTRAINT "_PracticeToSentence_A_fkey" FOREIGN KEY ("A") REFERENCES "practices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PracticeToSentence" ADD CONSTRAINT "_PracticeToSentence_B_fkey" FOREIGN KEY ("B") REFERENCES "sentences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PracticeToTopic" ADD CONSTRAINT "_PracticeToTopic_A_fkey" FOREIGN KEY ("A") REFERENCES "practices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PracticeToTopic" ADD CONSTRAINT "_PracticeToTopic_B_fkey" FOREIGN KEY ("B") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
