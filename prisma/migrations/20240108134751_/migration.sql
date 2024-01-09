-- CreateTable
CREATE TABLE "phoneticProEval" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "phoneme" TEXT NOT NULL,

    CONSTRAINT "phoneticProEval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userLearndWords" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "userLearndWords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userLearndSentences" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "userLearndSentences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SentenceToUserLearnedSentence" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_UserLearnedWordToWord" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SentenceToUserLearnedSentence_AB_unique" ON "_SentenceToUserLearnedSentence"("A", "B");

-- CreateIndex
CREATE INDEX "_SentenceToUserLearnedSentence_B_index" ON "_SentenceToUserLearnedSentence"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserLearnedWordToWord_AB_unique" ON "_UserLearnedWordToWord"("A", "B");

-- CreateIndex
CREATE INDEX "_UserLearnedWordToWord_B_index" ON "_UserLearnedWordToWord"("B");

-- AddForeignKey
ALTER TABLE "phoneticProEval" ADD CONSTRAINT "phoneticProEval_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userLearndWords" ADD CONSTRAINT "userLearndWords_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userLearndSentences" ADD CONSTRAINT "userLearndSentences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SentenceToUserLearnedSentence" ADD CONSTRAINT "_SentenceToUserLearnedSentence_A_fkey" FOREIGN KEY ("A") REFERENCES "sentences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SentenceToUserLearnedSentence" ADD CONSTRAINT "_SentenceToUserLearnedSentence_B_fkey" FOREIGN KEY ("B") REFERENCES "userLearndSentences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserLearnedWordToWord" ADD CONSTRAINT "_UserLearnedWordToWord_A_fkey" FOREIGN KEY ("A") REFERENCES "userLearndWords"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserLearnedWordToWord" ADD CONSTRAINT "_UserLearnedWordToWord_B_fkey" FOREIGN KEY ("B") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;
