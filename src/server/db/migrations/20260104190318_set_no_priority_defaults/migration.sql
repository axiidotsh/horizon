-- Update existing NULL priorities to NO_PRIORITY
UPDATE "tasks" SET "priority" = 'NO_PRIORITY' WHERE "priority" IS NULL;

-- Update existing NULL defaultTaskPriority to NO_PRIORITY
UPDATE "users" SET "defaultTaskPriority" = 'NO_PRIORITY' WHERE "defaultTaskPriority" IS NULL;

-- AlterTable - Make priority NOT NULL with default
ALTER TABLE "tasks" ALTER COLUMN "priority" SET NOT NULL,
ALTER COLUMN "priority" SET DEFAULT 'NO_PRIORITY';

-- AlterTable - Make defaultTaskPriority NOT NULL with default
ALTER TABLE "users" ALTER COLUMN "defaultTaskPriority" SET NOT NULL,
ALTER COLUMN "defaultTaskPriority" SET DEFAULT 'NO_PRIORITY';
