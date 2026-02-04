-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "completedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "tasks_userId_completedAt_idx" ON "tasks"("userId", "completedAt");
