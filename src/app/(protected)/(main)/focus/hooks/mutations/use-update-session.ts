import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { FOCUS_QUERY_KEYS } from '../focus-query-keys';
import type { FocusSession } from '../types';

export function useUpdateSession() {
  return useApiMutation(api.focus.sessions[':id'].$patch, {
    optimisticUpdate: {
      queryKey: FOCUS_QUERY_KEYS.activeSession,
      updater: (oldData: unknown, variables) => {
        const data = oldData as { session: FocusSession | null };
        if (!data.session) return data;
        return {
          ...data,
          session: { ...data.session, ...variables.json },
        };
      },
    },
    invalidateKeys: [FOCUS_QUERY_KEYS.activeSession],
  });
}
