'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
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
    <AlertDialog open={!!task} onOpenChange={(open) => !open && handleClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Task</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{task?.title}&quot;? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={handleClose}
            disabled={deleteTask.isPending}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTask.isPending}
              isLoading={deleteTask.isPending}
              loadingContent="Deleting..."
            >
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
