import { api } from '@/lib/rpc';
import { FOCUS_QUERY_KEYS } from './focus-query-keys';
import { useApiMutation } from './use-api-mutation';

export function useEndSessionEarly() {
  return useApiMutation(api.focus.sessions[':id']['end-early'].$patch, {
    invalidateKeys: [FOCUS_QUERY_KEYS.activeSession, FOCUS_QUERY_KEYS.sessions],
  });
}
