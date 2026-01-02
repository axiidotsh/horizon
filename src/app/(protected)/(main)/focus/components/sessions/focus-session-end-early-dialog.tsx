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
import { showEndEarlyDialogAtom } from '../../atoms/session-dialogs';
import { useFocusSession } from '../../hooks/mutations/use-focus-session';
import { useActiveSession } from '../../hooks/queries/use-active-session';

export const FocusSessionEndEarlyDialog = () => {
  const [open, setOpen] = useAtom(showEndEarlyDialogAtom);
  const { data: activeSession } = useActiveSession();
  const { endEarly } = useFocusSession(activeSession?.id);

  const handleEndEarly = () => {
    if (!activeSession) return;
    endEarly.mutate(
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
          <ResponsiveDialogTitle>End Session Early?</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Your progress will be saved. The session duration will be updated to
            reflect the actual time spent.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose asChild>
            <Button variant="outline" disabled={endEarly.isPending}>
              Keep Going
            </Button>
          </ResponsiveDialogClose>
          <Button
            variant="destructive"
            onClick={handleEndEarly}
            disabled={endEarly.isPending}
            isLoading={endEarly.isPending}
            loadingContent="Ending..."
          >
            End Session
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
