/*
  Warnings:

  - You are about to drop the `_Replies` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Replies" DROP CONSTRAINT "_Replies_A_fkey";

-- DropForeignKey
ALTER TABLE "_Replies" DROP CONSTRAINT "_Replies_B_fkey";

-- DropTable
DROP TABLE "_Replies";

-- CreateTable
CREATE TABLE "SubComment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentCommentId" TEXT NOT NULL,

    CONSTRAINT "SubComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SubComment" ADD CONSTRAINT "SubComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubComment" ADD CONSTRAINT "SubComment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "Comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
