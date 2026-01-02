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
import { showDiscardDialogAtom } from '../../atoms/session-dialogs';
import { useFocusSession } from '../../hooks/mutations/use-focus-session';
import { useActiveSession } from '../../hooks/queries/use-active-session';

export const FocusSessionDiscardDialog = () => {
  const [open, setOpen] = useAtom(showDiscardDialogAtom);
  const { data: activeSession } = useActiveSession();
  const { cancel } = useFocusSession(activeSession?.id);

  const handleDiscard = () => {
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
          <ResponsiveDialogTitle>
            Discard Completed Session?
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Are you sure you want to discard this session? This action cannot be
            undone and the session will not be saved.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose asChild>
            <Button variant="outline" disabled={cancel.isPending}>
              Cancel
            </Button>
          </ResponsiveDialogClose>
          <Button
            variant="destructive"
            onClick={handleDiscard}
            disabled={cancel.isPending}
            isLoading={cancel.isPending}
            loadingContent="Discarding..."
          >
            Discard Session
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
