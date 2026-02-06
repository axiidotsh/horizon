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
import { deletingProjectAtom } from '../../atoms/task-dialogs';
import { useDeleteProject } from '../../hooks/mutations/use-delete-project';

export const DeleteProjectDialog = () => {
  const [project, setProject] = useAtom(deletingProjectAtom);
  const deleteProject = useDeleteProject();

  const handleClose = () => {
    setProject(null);
  };

  const handleDelete = () => {
    if (!project) return;

    deleteProject.mutate(
      { param: { id: project.id } },
      { onSuccess: handleClose }
    );
  };

  return (
    <ResponsiveDialog
      open={!!project}
      onOpenChange={(open) => !open && handleClose()}
    >
      <ResponsiveDialogContent showCloseButton={false}>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Move to Trash</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            &quot;{project?.name}&quot; will be moved to trash and automatically
            deleted after 30 days. You can restore it anytime before then.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose asChild>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={deleteProject.isPending}
            >
              Cancel
            </Button>
          </ResponsiveDialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteProject.isPending}
            isLoading={deleteProject.isPending}
            loadingContent="Moving..."
          >
            Move to Trash
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
