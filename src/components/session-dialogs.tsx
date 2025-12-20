'use client';

import {
  createCustomSessionAtom,
  deletingSessionAtom,
  editingSessionAtom,
  showCancelDialogAtom,
  showDiscardDialogAtom,
  showEndEarlyDialogAtom,
} from '@/app/(protected)/(main)/focus/atoms/session-dialogs';
import { SessionCreateDialog } from '@/app/(protected)/(main)/focus/components/sessions/session-create-dialog';
import { SessionDeleteDialog } from '@/app/(protected)/(main)/focus/components/sessions/session-delete-dialog';
import { SessionEditDialog } from '@/app/(protected)/(main)/focus/components/sessions/session-edit-dialog';
import { useFocusSession } from '@/app/(protected)/(main)/focus/hooks/mutations/use-focus-session';
import { useActiveSession } from '@/app/(protected)/(main)/focus/hooks/queries/use-active-session';
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
import { useAtom } from 'jotai';

export function SessionDialogs() {
  const { data: activeSession } = useActiveSession();
  const { cancel, endEarly } = useFocusSession();

  const [showCancel, setShowCancel] = useAtom(showCancelDialogAtom);
  const [showEndEarly, setShowEndEarly] = useAtom(showEndEarlyDialogAtom);
  const [showDiscard, setShowDiscard] = useAtom(showDiscardDialogAtom);
  const [editingSession, setEditingSession] = useAtom(editingSessionAtom);
  const [deletingSession, setDeletingSession] = useAtom(deletingSessionAtom);
  const [createCustomOpen, setCreateCustomOpen] = useAtom(
    createCustomSessionAtom
  );

  const handleCancel = () => {
    if (!activeSession) return;
    cancel.mutate({ param: { id: activeSession.id } });
    setShowCancel(false);
  };

  const handleEndEarly = () => {
    if (!activeSession) return;
    endEarly.mutate({ param: { id: activeSession.id } });
    setShowEndEarly(false);
  };

  const handleDiscard = () => {
    if (!activeSession) return;
    cancel.mutate({ param: { id: activeSession.id } });
    setShowDiscard(false);
  };

  return (
    <>
      {/* Cancel Dialog */}
      <Dialog open={showCancel} onOpenChange={setShowCancel}>
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
              <Button variant="outline">Keep Going</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancel.isPending}
            >
              Cancel Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* End Early Dialog */}
      <Dialog open={showEndEarly} onOpenChange={setShowEndEarly}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>End Session Early?</DialogTitle>
            <DialogDescription>
              Your progress will be saved. The session duration will be updated
              to reflect the actual time spent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Keep Going</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleEndEarly}
              disabled={endEarly.isPending}
            >
              End Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discard Dialog */}
      <Dialog open={showDiscard} onOpenChange={setShowDiscard}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Discard Completed Session?</DialogTitle>
            <DialogDescription>
              Are you sure you want to discard this session? This action cannot
              be undone and the session will not be saved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDiscard}
              disabled={cancel.isPending}
            >
              Discard Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SessionEditDialog
        session={editingSession}
        open={!!editingSession}
        onOpenChange={(open) => !open && setEditingSession(null)}
      />
      <SessionDeleteDialog
        session={deletingSession}
        open={!!deletingSession}
        onOpenChange={(open) => !open && setDeletingSession(null)}
      />
      <SessionCreateDialog
        open={createCustomOpen}
        onOpenChange={setCreateCustomOpen}
      />
    </>
  );
}
