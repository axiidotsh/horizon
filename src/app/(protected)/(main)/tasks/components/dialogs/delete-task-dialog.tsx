'use client';

import { Button } from '@/components/ui/button';
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { useAtom } from 'jotai';
import { deletingTaskAtom } from '../../atoms/task-dialogs';
import { useDeleteTask } from '../../hooks/mutations/use-delete-task';

export const DeleteTaskDialog = () => {
  const [task, setTask] = useAtom(deletingTaskAtom);
  const deleteTask = useDeleteTask();

  const handleClose = () => {
    setTask(null);
  };

  const handleDelete = () => {
    if (!task) return;

    deleteTask.mutate({ param: { id: task.id } }, { onSuccess: handleClose });
  };

  return (
    <ResponsiveDialog
      open={!!task}
      onOpenChange={(open) => !open && handleClose()}
    >
      <ResponsiveDialogContent showCloseButton={false}>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Move to Trash</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            &quot;{task?.title}&quot; will be moved to trash and automatically
            deleted after 30 days. You can restore it anytime before then.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose asChild>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={deleteTask.isPending}
            >
              Cancel
            </Button>
          </ResponsiveDialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteTask.isPending}
            isLoading={deleteTask.isPending}
            loadingContent="Moving..."
          >
            Move to Trash
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
