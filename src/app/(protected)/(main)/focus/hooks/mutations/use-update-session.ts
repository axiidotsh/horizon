import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { useQueryClient } from '@tanstack/react-query';
import { FOCUS_QUERY_KEYS } from '../focus-query-keys';
import type { FocusSession } from '../types';

export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useApiMutation(api.focus.sessions[':id'].$patch, {
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: FOCUS_QUERY_KEYS.activeSession,
      });

      const previousData = queryClient.getQueryData(
        FOCUS_QUERY_KEYS.activeSession
      );

      queryClient.setQueryData(
        FOCUS_QUERY_KEYS.activeSession,
        (old: unknown) => {
          const data = old as { session: FocusSession | null };
          if (!data.session) return data;
          return {
            ...data,
            session: { ...data.session, ...variables.json },
          };
        }
      );

      return { previousData, snapshots: [] };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          FOCUS_QUERY_KEYS.activeSession,
          context.previousData
        );
      }
    },
    invalidateKeys: [FOCUS_QUERY_KEYS.activeSession],
  });
}
