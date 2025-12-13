import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { FOCUS_QUERY_KEYS } from '../focus-query-keys';

export function useUpdateSession() {
  return useApiMutation(api.focus.sessions[':id'].$patch, {
    invalidateKeys: [FOCUS_QUERY_KEYS.activeSession],
  });
}
