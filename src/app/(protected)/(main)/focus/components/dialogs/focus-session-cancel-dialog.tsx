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
import { cancelingSessionAtom } from '../../atoms/session-dialogs';
import { useFocusSession } from '../../hooks/mutations/use-focus-session';

export const FocusSessionCancelDialog = () => {
  const [session, setSession] = useAtom(cancelingSessionAtom);
  const { cancel } = useFocusSession();

  const handleCancel = () => {
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
