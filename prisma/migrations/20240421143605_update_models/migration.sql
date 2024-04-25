/*
  Warnings:

  - You are about to drop the column `isBan` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `vocabularySetId` on the `reviewReminders` table. All the data in the column will be lost.
  - The primary key for the `userLearnedWords` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userVocabularySetUserId` on the `userLearnedWords` table. All the data in the column will be lost.
  - You are about to drop the column `userVocabularySetVocabularySetId` on the `userLearnedWords` table. All the data in the column will be lost.
  - You are about to drop the column `vocabularySetId` on the `userLearnedWords` table. All the data in the column will be lost.
  - You are about to drop the `FavoriteItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FavoriteItemToSentence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FavoriteItemToWord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_VocabularySetToWord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userVocabularySets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vocabularySets` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FavoriteItem" DROP CONSTRAINT "FavoriteItem_userId_fkey";

-- DropForeignKey
ALTER TABLE "_FavoriteItemToSentence" DROP CONSTRAINT "_FavoriteItemToSentence_A_fkey";

-- DropForeignKey
ALTER TABLE "_FavoriteItemToSentence" DROP CONSTRAINT "_FavoriteItemToSentence_B_fkey";

-- DropForeignKey
ALTER TABLE "_FavoriteItemToWord" DROP CONSTRAINT "_FavoriteItemToWord_A_fkey";

-- DropForeignKey
ALTER TABLE "_FavoriteItemToWord" DROP CONSTRAINT "_FavoriteItemToWord_B_fkey";

-- DropForeignKey
ALTER TABLE "_VocabularySetToWord" DROP CONSTRAINT "_VocabularySetToWord_A_fkey";

-- DropForeignKey
ALTER TABLE "_VocabularySetToWord" DROP CONSTRAINT "_VocabularySetToWord_B_fkey";

-- DropForeignKey
ALTER TABLE "reviewReminders" DROP CONSTRAINT "reviewReminders_vocabularySetId_fkey";

-- DropForeignKey
ALTER TABLE "userLearnedWords" DROP CONSTRAINT "userLearnedWords_userVocabularySetUserId_userVocabularySet_fkey";

-- DropForeignKey
ALTER TABLE "userLearnedWords" DROP CONSTRAINT "userLearnedWords_vocabularySetId_fkey";

-- DropForeignKey
ALTER TABLE "userVocabularySets" DROP CONSTRAINT "userVocabularySets_userId_fkey";

-- DropForeignKey
ALTER TABLE "userVocabularySets" DROP CONSTRAINT "userVocabularySets_vocabularySetId_fkey";

-- DropForeignKey
ALTER TABLE "vocabularySets" DROP CONSTRAINT "vocabularySets_specId_fkey";

-- DropForeignKey
ALTER TABLE "vocabularySets" DROP CONSTRAINT "vocabularySets_topicId_fkey";

-- DropForeignKey
ALTER TABLE "vocabularySets" DROP CONSTRAINT "vocabularySets_userId_fkey";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "isBan",
ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "reviewReminders" DROP COLUMN "vocabularySetId",
ADD COLUMN     "vocabularyPackId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "userLearnedWords" DROP CONSTRAINT "userLearnedWords_pkey",
DROP COLUMN "userVocabularySetUserId",
DROP COLUMN "userVocabularySetVocabularySetId",
DROP COLUMN "vocabularySetId",
ADD COLUMN     "userVocabularyPackUserId" INTEGER,
ADD COLUMN     "userVocabularyPackVocabularyPackId" INTEGER,
ADD COLUMN     "vocabularyPackId" INTEGER NOT NULL DEFAULT 1,
ADD CONSTRAINT "userLearnedWords_pkey" PRIMARY KEY ("userId", "wordId", "vocabularyPackId");

-- DropTable
DROP TABLE "FavoriteItem";

-- DropTable
DROP TABLE "_FavoriteItemToSentence";

-- DropTable
DROP TABLE "_FavoriteItemToWord";

-- DropTable
DROP TABLE "_VocabularySetToWord";

-- DropTable
DROP TABLE "userVocabularySets";

-- DropTable
DROP TABLE "vocabularySets";

-- CreateTable
CREATE TABLE "Favorite" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "wordId" INTEGER,
    "sentenceId" INTEGER,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabularyPacks" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "picture" TEXT,
    "specId" INTEGER,
    "topicId" INTEGER,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vocabularyPacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userVocabularyPacks" (
    "userId" INTEGER NOT NULL,
    "vocabularyPackId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "userVocabularyPacks_pkey" PRIMARY KEY ("userId","vocabularyPackId")
);

-- CreateTable
CREATE TABLE "_VocabularyPackToWord" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "userVocabularyPacks_userId_vocabularyPackId_key" ON "userVocabularyPacks"("userId", "vocabularyPackId");

-- CreateIndex
CREATE UNIQUE INDEX "_VocabularyPackToWord_AB_unique" ON "_VocabularyPackToWord"("A", "B");

-- CreateIndex
CREATE INDEX "_VocabularyPackToWord_B_index" ON "_VocabularyPackToWord"("B");

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_sentenceId_fkey" FOREIGN KEY ("sentenceId") REFERENCES "sentences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userLearnedWords" ADD CONSTRAINT "userLearnedWords_userVocabularyPackUserId_userVocabularyPa_fkey" FOREIGN KEY ("userVocabularyPackUserId", "userVocabularyPackVocabularyPackId") REFERENCES "userVocabularyPacks"("userId", "vocabularyPackId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userLearnedWords" ADD CONSTRAINT "userLearnedWords_vocabularyPackId_fkey" FOREIGN KEY ("vocabularyPackId") REFERENCES "vocabularyPacks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabularyPacks" ADD CONSTRAINT "vocabularyPacks_specId_fkey" FOREIGN KEY ("specId") REFERENCES "specializations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabularyPacks" ADD CONSTRAINT "vocabularyPacks_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabularyPacks" ADD CONSTRAINT "vocabularyPacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userVocabularyPacks" ADD CONSTRAINT "userVocabularyPacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userVocabularyPacks" ADD CONSTRAINT "userVocabularyPacks_vocabularyPackId_fkey" FOREIGN KEY ("vocabularyPackId") REFERENCES "vocabularyPacks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviewReminders" ADD CONSTRAINT "reviewReminders_vocabularyPackId_fkey" FOREIGN KEY ("vocabularyPackId") REFERENCES "vocabularyPacks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VocabularyPackToWord" ADD CONSTRAINT "_VocabularyPackToWord_A_fkey" FOREIGN KEY ("A") REFERENCES "vocabularyPacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VocabularyPackToWord" ADD CONSTRAINT "_VocabularyPackToWord_B_fkey" FOREIGN KEY ("B") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;
