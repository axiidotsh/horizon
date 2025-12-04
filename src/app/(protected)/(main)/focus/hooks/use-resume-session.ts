import { api } from '@/lib/rpc';
import { FOCUS_QUERY_KEYS } from './focus-query-keys';
import { useApiMutation } from './use-api-mutation';

export function useResumeSession() {
  return useApiMutation(api.focus.sessions[':id'].resume.$patch, {
    invalidateKeys: [FOCUS_QUERY_KEYS.activeSession],
  });
}
