/*
  Warnings:

  - You are about to drop the column `picture` on the `words` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "words" DROP COLUMN "picture",
ADD COLUMN     "pictures" TEXT[];
