import { DASHBOARD_QUERY_KEYS } from '@/app/(protected)/(main)/dashboard/hooks/dashboard-query-keys';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { calculateFocusStats } from '../../utils/focus-stats-calculations';
import { FOCUS_QUERY_KEYS } from '../focus-query-keys';
import type { FocusSession } from '../types';

function updateSessionQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  sessionId: string
) {
  const sessionQueries = queryClient.getQueriesData<{
    sessions: FocusSession[];
  }>({
    queryKey: FOCUS_QUERY_KEYS.sessions,
  });

  const previousSessionData = sessionQueries.map(([queryKey, data]) => ({
    queryKey,
    data,
  }));

  sessionQueries.forEach(([queryKey, data]) => {
    if (data?.sessions) {
      const updatedSessions = data.sessions.filter(
        (session) => session.id !== sessionId
      );
      queryClient.setQueryData(queryKey, { sessions: updatedSessions });

      const newStats = calculateFocusStats(updatedSessions);
      queryClient.setQueryData<{ stats: typeof newStats }>(
        FOCUS_QUERY_KEYS.stats,
        { stats: newStats }
      );
    }
  });

  return previousSessionData;
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  const invalidateKeys: QueryKey[] = [
    FOCUS_QUERY_KEYS.sessions,
    FOCUS_QUERY_KEYS.stats,
    DASHBOARD_QUERY_KEYS.metrics,
    DASHBOARD_QUERY_KEYS.heatmap,
  ];

  return useApiMutation(api.focus.sessions[':id'].$delete, {
    invalidateKeys,
    onMutate: async (variables: { param: { id: string } }) => {
      const previousSessionData = updateSessionQueries(
        queryClient,
        variables.param.id
      );
      const previousStats = queryClient.getQueryData(FOCUS_QUERY_KEYS.stats);
      return { previousSessionData, previousStats, snapshots: [] };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousSessionData) {
        context.previousSessionData.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousStats) {
        queryClient.setQueryData(FOCUS_QUERY_KEYS.stats, context.previousStats);
      }
    },
  });
}
