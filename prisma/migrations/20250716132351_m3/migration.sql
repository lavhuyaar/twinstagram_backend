-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_replyToCommentId_fkey";

-- CreateTable
CREATE TABLE "_Replies" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_Replies_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_Replies_B_index" ON "_Replies"("B");

-- AddForeignKey
ALTER TABLE "_Replies" ADD CONSTRAINT "_Replies_A_fkey" FOREIGN KEY ("A") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Replies" ADD CONSTRAINT "_Replies_B_fkey" FOREIGN KEY ("B") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
