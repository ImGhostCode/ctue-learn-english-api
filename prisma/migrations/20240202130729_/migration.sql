/*
  Warnings:

  - You are about to drop the column `mean` on the `irregularVerbs` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `vocabularySets` table. All the data in the column will be lost.
  - You are about to drop the `WordMean` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `meaning` to the `irregularVerbs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `vocabularySets` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WordMean" DROP CONSTRAINT "WordMean_typeId_fkey";

-- DropForeignKey
ALTER TABLE "WordMean" DROP CONSTRAINT "WordMean_wordId_fkey";

-- AlterTable
ALTER TABLE "irregularVerbs" DROP COLUMN "mean",
ADD COLUMN     "meaning" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "vocabularySets" DROP COLUMN "name",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "title" TEXT NOT NULL;

-- DropTable
DROP TABLE "WordMean";

-- CreateTable
CREATE TABLE "WordMeaning" (
    "wordId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,
    "meaning" TEXT NOT NULL,

    CONSTRAINT "WordMeaning_pkey" PRIMARY KEY ("wordId","typeId")
);

-- AddForeignKey
ALTER TABLE "WordMeaning" ADD CONSTRAINT "WordMeaning_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordMeaning" ADD CONSTRAINT "WordMeaning_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
