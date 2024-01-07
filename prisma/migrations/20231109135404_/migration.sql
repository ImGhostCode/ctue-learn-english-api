/*
  Warnings:

  - You are about to drop the `IrregularVerb` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "IrregularVerb";

-- CreateTable
CREATE TABLE "irregularVerbs" (
    "id" SERIAL NOT NULL,
    "v1" TEXT NOT NULL,
    "v2" TEXT NOT NULL,
    "v3" TEXT NOT NULL,
    "mean" TEXT NOT NULL,

    CONSTRAINT "irregularVerbs_pkey" PRIMARY KEY ("id")
);
