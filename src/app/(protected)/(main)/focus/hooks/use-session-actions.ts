import { useSetAtom } from 'jotai';
import { editingSessionAtom } from '../atoms/session-dialogs';
import { useDeleteSession } from './mutations/use-delete-session';
import type { FocusSession } from './types';

export function useSessionActions() {
  const setEditingSession = useSetAtom(editingSessionAtom);
  const deleteSession = useDeleteSession();

  function handleEdit(session: FocusSession) {
    setEditingSession(session);
  }

  function handleDelete(session: FocusSession) {
    deleteSession.mutate({ param: { id: session.id } });
  }

  return {
    handleEdit,
    handleDelete,
  };
}
