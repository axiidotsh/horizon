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

interface SessionEndEarlyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SessionEndEarlyDialog = ({
  open,
  onOpenChange,
}: SessionEndEarlyDialogProps) => {
  const { data: activeSession } = useActiveSession();
  const { endEarly } = useFocusSession();

  const handleEndEarly = () => {
    if (!activeSession) return;
    endEarly.mutate({ param: { id: activeSession.id } });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>End Session Early?</DialogTitle>
          <DialogDescription>
            Your progress will be saved. The session duration will be updated to
            reflect the actual time spent.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={endEarly.isPending}>
              Keep Going
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleEndEarly}
            disabled={endEarly.isPending}
            isLoading={endEarly.isPending}
            loadingContent="Ending..."
          >
            End Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
