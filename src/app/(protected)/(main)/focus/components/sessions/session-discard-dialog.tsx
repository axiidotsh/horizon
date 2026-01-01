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
  const { cancel } = useFocusSession(activeSession?.id);

  const handleDiscard = () => {
    if (!activeSession) return;
    cancel.mutate({ param: { id: activeSession.id } });
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
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
