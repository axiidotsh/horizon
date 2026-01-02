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
import { deletingSessionAtom } from '../../atoms/session-dialogs';
import { useDeleteSession } from '../../hooks/mutations/use-delete-session';

export const FocusSessionDeleteDialog = () => {
  const [session, setSession] = useAtom(deletingSessionAtom);
  const deleteSession = useDeleteSession();

  const handleDelete = () => {
    if (!session) return;

    deleteSession.mutate(
      { param: { id: session.id } },
      {
        onSuccess: () => setSession(null),
      }
    );
  };

  return (
    <ResponsiveDialog
      open={!!session}
      onOpenChange={(open) => !open && setSession(null)}
    >
      <ResponsiveDialogContent showCloseButton={false}>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Delete Session?</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Are you sure you want to delete this session
            {session?.task ? ` "${session.task}"` : ''}? This action cannot be
            undone.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose asChild>
            <Button variant="outline" disabled={deleteSession.isPending}>
              Cancel
            </Button>
          </ResponsiveDialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteSession.isPending}
            isLoading={deleteSession.isPending}
            loadingContent="Deleting..."
          >
            Delete Session
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
