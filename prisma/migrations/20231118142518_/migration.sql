/*
  Warnings:

  - You are about to drop the column `nRightConsecitive` on the `practices` table. All the data in the column will be lost.
  - Added the required column `nRightConsecutive` to the `practices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "practices" DROP COLUMN "nRightConsecitive",
ADD COLUMN     "nRightConsecutive" INTEGER NOT NULL;
