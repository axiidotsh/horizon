'use client';

import {
  createCustomSessionAtom,
  deletingSessionAtom,
  editingSessionAtom,
  showCancelDialogAtom,
  showDiscardDialogAtom,
  showEndEarlyDialogAtom,
} from '@/app/(protected)/(main)/focus/atoms/session-dialogs';
import { SessionCancelDialog } from '@/app/(protected)/(main)/focus/components/sessions/session-cancel-dialog';
import { SessionCreateDialog } from '@/app/(protected)/(main)/focus/components/sessions/session-create-dialog';
import { SessionDeleteDialog } from '@/app/(protected)/(main)/focus/components/sessions/session-delete-dialog';
import { SessionDiscardDialog } from '@/app/(protected)/(main)/focus/components/sessions/session-discard-dialog';
import { SessionEditDialog } from '@/app/(protected)/(main)/focus/components/sessions/session-edit-dialog';
import { SessionEndEarlyDialog } from '@/app/(protected)/(main)/focus/components/sessions/session-end-early-dialog';
import { useAtom } from 'jotai';

export function SessionDialogs() {
  const [showCancel, setShowCancel] = useAtom(showCancelDialogAtom);
  const [showEndEarly, setShowEndEarly] = useAtom(showEndEarlyDialogAtom);
  const [showDiscard, setShowDiscard] = useAtom(showDiscardDialogAtom);
  const [editingSession, setEditingSession] = useAtom(editingSessionAtom);
  const [deletingSession, setDeletingSession] = useAtom(deletingSessionAtom);
  const [createCustomOpen, setCreateCustomOpen] = useAtom(
    createCustomSessionAtom
  );

  return (
    <>
      <SessionCancelDialog open={showCancel} onOpenChange={setShowCancel} />
      <SessionEndEarlyDialog
        open={showEndEarly}
        onOpenChange={setShowEndEarly}
      />
      <SessionDiscardDialog open={showDiscard} onOpenChange={setShowDiscard} />
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
