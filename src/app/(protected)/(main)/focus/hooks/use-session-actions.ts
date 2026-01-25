import { useSetAtom } from 'jotai';
import {
  deletingSessionAtom,
  editingSessionAtom,
} from '../atoms/session-dialogs';
import type { FocusSession } from './types';

export function useSessionActions() {
  const setEditingSession = useSetAtom(editingSessionAtom);
  const setDeletingSession = useSetAtom(deletingSessionAtom);

  function handleEdit(session: FocusSession) {
    setEditingSession(session);
  }

  function handleDelete(session: FocusSession) {
    setDeletingSession(session);
  }

  return {
    handleEdit,
    handleDelete,
  };
}
