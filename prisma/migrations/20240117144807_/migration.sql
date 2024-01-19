/*
  Warnings:

  - You are about to drop the column `mean` on the `words` table. All the data in the column will be lost.
  - You are about to drop the column `typeId` on the `words` table. All the data in the column will be lost.
  - The `picture` column on the `words` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "words" DROP CONSTRAINT "words_typeId_fkey";

-- AlterTable
ALTER TABLE "words" DROP COLUMN "mean",
DROP COLUMN "typeId",
DROP COLUMN "picture",
ADD COLUMN     "picture" TEXT[];

-- CreateTable
CREATE TABLE "WordMean" (
    "wordId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,
    "meaning" TEXT NOT NULL,

    CONSTRAINT "WordMean_pkey" PRIMARY KEY ("wordId","typeId")
);

-- AddForeignKey
ALTER TABLE "WordMean" ADD CONSTRAINT "WordMean_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordMean" ADD CONSTRAINT "WordMean_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
