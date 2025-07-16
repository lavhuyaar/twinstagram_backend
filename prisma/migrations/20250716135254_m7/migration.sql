/*
  Warnings:

  - Added the required column `content` to the `SubComment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubComment" ADD COLUMN     "content" VARCHAR(200) NOT NULL;
