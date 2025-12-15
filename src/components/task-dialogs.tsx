'use client';

import { BulkAddTasksSheet } from '@/app/(protected)/(main)/tasks/components/dialogs/bulk-add-tasks-sheet';
import { CreateTaskDialog } from '@/app/(protected)/(main)/tasks/components/dialogs/create-task-dialog';
import { DeleteTaskDialog } from '@/app/(protected)/(main)/tasks/components/dialogs/delete-task-dialog';
import { EditTaskDialog } from '@/app/(protected)/(main)/tasks/components/dialogs/edit-task-dialog';

export function TaskDialogs() {
  return (
    <>
      <CreateTaskDialog />
      <EditTaskDialog />
      <DeleteTaskDialog />
      <BulkAddTasksSheet />
    </>
  );
}
