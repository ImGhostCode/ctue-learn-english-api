-- CreateTable
CREATE TABLE "reviewReminders" (
    "id" SERIAL NOT NULL,
    "userVocabularySetId" INTEGER NOT NULL,
    "isDone" BOOLEAN NOT NULL,
    "reviewAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviewReminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ReviewReminderToWord" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ReviewReminderToWord_AB_unique" ON "_ReviewReminderToWord"("A", "B");

-- CreateIndex
CREATE INDEX "_ReviewReminderToWord_B_index" ON "_ReviewReminderToWord"("B");

-- AddForeignKey
ALTER TABLE "reviewReminders" ADD CONSTRAINT "reviewReminders_userVocabularySetId_fkey" FOREIGN KEY ("userVocabularySetId") REFERENCES "userVocabularySets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReviewReminderToWord" ADD CONSTRAINT "_ReviewReminderToWord_A_fkey" FOREIGN KEY ("A") REFERENCES "reviewReminders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReviewReminderToWord" ADD CONSTRAINT "_ReviewReminderToWord_B_fkey" FOREIGN KEY ("B") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;
