import { api } from '@/lib/rpc';
import { FOCUS_QUERY_KEYS } from './focus-query-keys';
import { useApiMutation } from './use-api-mutation';

export function useUpdateSession() {
  return useApiMutation(api.focus.sessions[':id'].$patch, {
    invalidateKeys: [FOCUS_QUERY_KEYS.activeSession],
  });
}
