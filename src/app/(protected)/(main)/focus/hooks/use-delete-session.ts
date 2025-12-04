import { api } from '@/lib/rpc';
import { FOCUS_QUERY_KEYS } from './focus-query-keys';
import { useApiMutation } from './use-api-mutation';

export function useDeleteSession() {
  return useApiMutation(api.focus.sessions[':id'].$delete, {
    invalidateKeys: [FOCUS_QUERY_KEYS.sessions],
  });
}
