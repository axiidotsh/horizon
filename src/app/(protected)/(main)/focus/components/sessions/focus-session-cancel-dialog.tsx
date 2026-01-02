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
import { showCancelDialogAtom } from '../../atoms/session-dialogs';
import { useFocusSession } from '../../hooks/mutations/use-focus-session';
import { useActiveSession } from '../../hooks/queries/use-active-session';

export const FocusSessionCancelDialog = () => {
  const [open, setOpen] = useAtom(showCancelDialogAtom);
  const { data: activeSession } = useActiveSession();
  const { cancel } = useFocusSession(activeSession?.id);

  const handleCancel = () => {
    if (!activeSession) return;
    cancel.mutate(
      { param: { id: activeSession.id } },
      {
        onSuccess: () => setOpen(false),
      }
    );
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogContent showCloseButton={false}>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Cancel Focus Session?</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Are you sure you want to cancel this focus session? Your progress
            will not be saved.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose asChild>
            <Button variant="outline" disabled={cancel.isPending}>
              Keep Going
            </Button>
          </ResponsiveDialogClose>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancel.isPending}
            isLoading={cancel.isPending}
            loadingContent="Cancelling..."
          >
            Cancel Session
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
