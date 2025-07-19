/*
  Warnings:

  - Added the required column `postId` to the `SubComment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubComment" ADD COLUMN     "postId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "SubComment" ADD CONSTRAINT "SubComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
