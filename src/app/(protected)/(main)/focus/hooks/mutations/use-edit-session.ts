import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { FOCUS_QUERY_KEYS } from '../focus-query-keys';

export function useEditSession() {
  return useApiMutation(api.focus.sessions[':id'].$patch, {
    invalidateKeys: [
      FOCUS_QUERY_KEYS.activeSession,
      FOCUS_QUERY_KEYS.sessions,
      FOCUS_QUERY_KEYS.stats,
    ],
  });
}
