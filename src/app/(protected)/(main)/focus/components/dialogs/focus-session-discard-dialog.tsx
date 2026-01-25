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
import { discardingSessionAtom } from '../../atoms/session-dialogs';
import { useFocusSession } from '../../hooks/mutations/use-focus-session';

export const FocusSessionDiscardDialog = () => {
  const [session, setSession] = useAtom(discardingSessionAtom);
  const { cancel } = useFocusSession();

  const handleDiscard = () => {
    if (!session) return;
    cancel.mutate(
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
