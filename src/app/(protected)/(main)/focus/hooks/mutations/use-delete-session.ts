import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { FOCUS_QUERY_KEYS } from '../focus-query-keys';

export function useDeleteSession() {
  return useApiMutation(api.focus.sessions[':id'].$delete, {
    invalidateKeys: [FOCUS_QUERY_KEYS.sessions, FOCUS_QUERY_KEYS.stats],
  });
}
