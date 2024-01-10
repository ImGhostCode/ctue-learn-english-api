/*
  Warnings:

  - You are about to drop the column `userId` on the `userLearndSentences` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `userLearndWords` table. All the data in the column will be lost.
  - You are about to drop the `_SentenceToUserLearnedSentence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserLearnedWordToWord` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `sentence_id` to the `userLearndSentences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `userLearndSentences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `userLearndSentences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `userLearndWords` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `userLearndWords` table without a default value. This is not possible if the table is not empty.
  - Added the required column `word_id` to the `userLearndWords` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_SentenceToUserLearnedSentence" DROP CONSTRAINT "_SentenceToUserLearnedSentence_A_fkey";

-- DropForeignKey
ALTER TABLE "_SentenceToUserLearnedSentence" DROP CONSTRAINT "_SentenceToUserLearnedSentence_B_fkey";

-- DropForeignKey
ALTER TABLE "_UserLearnedWordToWord" DROP CONSTRAINT "_UserLearnedWordToWord_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserLearnedWordToWord" DROP CONSTRAINT "_UserLearnedWordToWord_B_fkey";

-- DropForeignKey
ALTER TABLE "userLearndSentences" DROP CONSTRAINT "userLearndSentences_userId_fkey";

-- DropForeignKey
ALTER TABLE "userLearndWords" DROP CONSTRAINT "userLearndWords_userId_fkey";

-- AlterTable
ALTER TABLE "userLearndSentences" DROP COLUMN "userId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sentence_id" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "userLearndWords" DROP COLUMN "userId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ADD COLUMN     "word_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_SentenceToUserLearnedSentence";

-- DropTable
DROP TABLE "_UserLearnedWordToWord";

-- AddForeignKey
ALTER TABLE "userLearndWords" ADD CONSTRAINT "userLearndWords_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "words"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userLearndWords" ADD CONSTRAINT "userLearndWords_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userLearndSentences" ADD CONSTRAINT "userLearndSentences_sentence_id_fkey" FOREIGN KEY ("sentence_id") REFERENCES "sentences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userLearndSentences" ADD CONSTRAINT "userLearndSentences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
