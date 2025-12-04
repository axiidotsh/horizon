import { api } from '@/lib/rpc';
import { FOCUS_QUERY_KEYS } from './focus-query-keys';
import { useApiMutation } from './use-api-mutation';

export function useStartSession() {
  return useApiMutation(api.focus.sessions.$post, {
    invalidateKeys: [FOCUS_QUERY_KEYS.activeSession],
  });
}
