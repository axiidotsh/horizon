-- AlterTable
ALTER TABLE "users" ADD COLUMN     "commandMenuPosition" TEXT NOT NULL DEFAULT 'top',
ADD COLUMN     "defaultFocusDuration" INTEGER NOT NULL DEFAULT 45,
ADD COLUMN     "defaultTaskPriority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM';
