-- AlterTable
ALTER TABLE "vocabularySets" ADD COLUMN     "picture" TEXT,
ADD COLUMN     "specId" INTEGER,
ADD COLUMN     "topicId" INTEGER;

-- AddForeignKey
ALTER TABLE "vocabularySets" ADD CONSTRAINT "vocabularySets_specId_fkey" FOREIGN KEY ("specId") REFERENCES "specializations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabularySets" ADD CONSTRAINT "vocabularySets_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
