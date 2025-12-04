import { api } from '@/lib/rpc';
import { FOCUS_QUERY_KEYS } from './focus-query-keys';
import { useApiMutation } from './use-api-mutation';

export function useCompleteSession() {
  return useApiMutation(api.focus.sessions[':id'].complete.$patch, {
    invalidateKeys: [FOCUS_QUERY_KEYS.activeSession, FOCUS_QUERY_KEYS.sessions],
  });
}
