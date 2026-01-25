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
import { endingEarlySessionAtom } from '../../atoms/session-dialogs';
import { useFocusSession } from '../../hooks/mutations/use-focus-session';

export const FocusSessionEndEarlyDialog = () => {
  const [session, setSession] = useAtom(endingEarlySessionAtom);
  const { endEarly } = useFocusSession();

  const handleEndEarly = () => {
    if (!session) return;
    endEarly.mutate(
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
