/*
  Warnings:

  - You are about to drop the column `repliedToCommentId` on the `Comment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "repliedToCommentId",
ADD COLUMN     "replyToCommentId" TEXT;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_replyToCommentId_fkey" FOREIGN KEY ("replyToCommentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
