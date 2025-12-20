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

interface SessionCancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SessionCancelDialog = ({
  open,
  onOpenChange,
}: SessionCancelDialogProps) => {
  const { data: activeSession } = useActiveSession();
  const { cancel } = useFocusSession();

  const handleCancel = () => {
    if (!activeSession) return;
    cancel.mutate({ param: { id: activeSession.id } });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Cancel Focus Session?</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this focus session? Your progress
            will not be saved.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={cancel.isPending}>
              Keep Going
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancel.isPending}
            isLoading={cancel.isPending}
            loadingContent="Cancelling..."
          >
            Cancel Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
