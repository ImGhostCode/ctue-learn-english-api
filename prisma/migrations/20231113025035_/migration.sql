/*
  Warnings:

  - You are about to drop the column `result` on the `practices` table. All the data in the column will be lost.
  - You are about to drop the column `reviewDay` on the `practices` table. All the data in the column will be lost.
  - You are about to drop the `highScores` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `nRight` to the `practices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nRightConsecitive` to the `practices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nWrong` to the `practices` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "highScores" DROP CONSTRAINT "highScores_userId_fkey";

-- AlterTable
ALTER TABLE "practices" DROP COLUMN "result",
DROP COLUMN "reviewDay",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nRight" INTEGER NOT NULL,
ADD COLUMN     "nRightConsecitive" INTEGER NOT NULL,
ADD COLUMN     "nWrong" INTEGER NOT NULL;

-- DropTable
DROP TABLE "highScores";
