-- DropIndex
DROP INDEX "focus_sessions_userId_status_idx";

-- CreateIndex
CREATE INDEX "focus_sessions_userId_status_startedAt_idx" ON "focus_sessions"("userId", "status", "startedAt");

-- CreateIndex
CREATE INDEX "habits_userId_archived_currentStreak_idx" ON "habits"("userId", "archived", "currentStreak");

-- CreateIndex
CREATE INDEX "tasks_userId_completed_dueDate_idx" ON "tasks"("userId", "completed", "dueDate");
