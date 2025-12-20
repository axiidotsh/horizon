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
import { useFocusSession } from '../../hooks/mutations/use-focus-session';
import { useActiveSession } from '../../hooks/queries/use-active-session';

interface SessionDiscardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SessionDiscardDialog = ({
  open,
  onOpenChange,
}: SessionDiscardDialogProps) => {
  const { data: activeSession } = useActiveSession();
  const { cancel } = useFocusSession();

  const handleDiscard = () => {
    if (!activeSession) return;
    cancel.mutate({ param: { id: activeSession.id } });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Discard Completed Session?</DialogTitle>
          <DialogDescription>
            Are you sure you want to discard this session? This action cannot be
            undone and the session will not be saved.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={cancel.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDiscard}
            disabled={cancel.isPending}
            isLoading={cancel.isPending}
            loadingContent="Discarding..."
          >
            Discard Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
