/*
  Warnings:

  - Added the required column `userId` to the `reviewReminders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reviewReminders" ADD COLUMN     "userId" INTEGER NOT NULL,
ALTER COLUMN "isDone" SET DEFAULT false;

-- AddForeignKey
ALTER TABLE "reviewReminders" ADD CONSTRAINT "reviewReminders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
