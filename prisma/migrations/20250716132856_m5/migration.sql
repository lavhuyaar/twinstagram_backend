/*
  Warnings:

  - You are about to drop the column `replyToCommentId` on the `Comment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "replyToCommentId";
