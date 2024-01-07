/*
  Warnings:

  - You are about to drop the `CommunicationPhrase` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "CommunicationPhrase";

-- CreateTable
CREATE TABLE "IrregularVerb" (
    "id" SERIAL NOT NULL,
    "v1" TEXT NOT NULL,
    "v2" TEXT NOT NULL,
    "v3" TEXT NOT NULL,
    "mean" TEXT NOT NULL,

    CONSTRAINT "IrregularVerb_pkey" PRIMARY KEY ("id")
);
