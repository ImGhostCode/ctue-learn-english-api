-- AlterTable
ALTER TABLE "reviewReminders" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "userLearnedWords" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "userVocabularySets" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
