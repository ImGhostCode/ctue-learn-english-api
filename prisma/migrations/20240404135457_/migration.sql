/*
  Warnings:

  - You are about to drop the column `mean` on the `sentences` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "sentences" DROP COLUMN "mean",
ADD COLUMN     "meaning" TEXT NOT NULL DEFAULT '';
