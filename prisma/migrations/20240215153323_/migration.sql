/*
  Warnings:

  - You are about to drop the column `pronunciationAssessment` on the `phonemeAssessments` table. All the data in the column will be lost.
  - Added the required column `pronunciationAssessmentId` to the `phonemeAssessments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "phonemeAssessments" DROP CONSTRAINT "phonemeAssessments_pronunciationAssessment_fkey";

-- AlterTable
ALTER TABLE "phonemeAssessments" DROP COLUMN "pronunciationAssessment",
ADD COLUMN     "pronunciationAssessmentId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "phonemeAssessments" ADD CONSTRAINT "phonemeAssessments_pronunciationAssessmentId_fkey" FOREIGN KEY ("pronunciationAssessmentId") REFERENCES "pronunciationAssessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
