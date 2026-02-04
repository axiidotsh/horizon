/*
  Warnings:

  - You are about to drop the column `archived` on the `habits` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "habits_userId_archived_idx";

-- AlterTable
ALTER TABLE "habits" DROP COLUMN "archived";
