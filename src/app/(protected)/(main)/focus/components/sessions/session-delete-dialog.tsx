'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteSession } from '../../hooks/mutations/use-delete-session';
import type { FocusSession } from '../../hooks/types';

interface SessionDeleteDialogProps {
  session: FocusSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SessionDeleteDialog = ({
  session,
  open,
  onOpenChange,
}: SessionDeleteDialogProps) => {
  const deleteSession = useDeleteSession();

  const handleDelete = () => {
    if (!session) return;

    deleteSession.mutate(
      { param: { id: session.id } },
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Delete Session?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this session
            {session?.task ? ` "${session.task}"` : ''}? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={deleteSession.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteSession.isPending}
            isLoading={deleteSession.isPending}
            loadingContent="Deleting..."
          >
            Delete Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
