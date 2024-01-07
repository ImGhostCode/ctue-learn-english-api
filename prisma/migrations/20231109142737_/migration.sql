/*
  Warnings:

  - The `status` column on the `contributions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "contributions" DROP COLUMN "status",
ADD COLUMN     "status" INTEGER;
