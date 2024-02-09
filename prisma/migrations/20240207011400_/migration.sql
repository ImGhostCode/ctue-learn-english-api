/*
  Warnings:

  - You are about to drop the `pronunciationAssessment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "phonemeAssessments" DROP CONSTRAINT "phonemeAssessments_pronunciationAssessment_fkey";

-- DropForeignKey
ALTER TABLE "pronunciationAssessment" DROP CONSTRAINT "pronunciationAssessment_userId_fkey";

-- DropTable
DROP TABLE "pronunciationAssessment";

-- CreateTable
CREATE TABLE "pronunciationAssessments" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "label" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pronunciationAssessments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pronunciationAssessments" ADD CONSTRAINT "pronunciationAssessments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phonemeAssessments" ADD CONSTRAINT "phonemeAssessments_pronunciationAssessment_fkey" FOREIGN KEY ("pronunciationAssessment") REFERENCES "pronunciationAssessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
