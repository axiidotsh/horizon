import { DASHBOARD_QUERY_KEYS } from '@/app/(protected)/(main)/dashboard/hooks/dashboard-query-keys';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { calculateFocusStats } from '../../utils/focus-stats-calculations';
import { FOCUS_QUERY_KEYS } from '../focus-query-keys';
import type { FocusSession } from '../types';

export function useEditSession() {
  const queryClient = useQueryClient();

  const invalidateKeys: QueryKey[] = [
    FOCUS_QUERY_KEYS.activeSession,
    FOCUS_QUERY_KEYS.sessions,
    FOCUS_QUERY_KEYS.stats,
    DASHBOARD_QUERY_KEYS.metrics,
    DASHBOARD_QUERY_KEYS.heatmap,
  ];

  return useApiMutation(api.focus.sessions[':id'].$patch, {
    invalidateKeys,
    onMutate: async (variables) => {
      const sessionId = variables.param.id;
      const updates = variables.json;

      const activeSessionData = queryClient.getQueryData(
        FOCUS_QUERY_KEYS.activeSession
      );

      if (activeSessionData) {
        const data = activeSessionData as { session: FocusSession | null };
        if (data.session) {
          queryClient.setQueryData(FOCUS_QUERY_KEYS.activeSession, {
            ...data,
            session: { ...data.session, ...updates },
          });
        }
      }

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
          const updatedSessions = data.sessions.map((session) =>
            session.id === sessionId ? { ...session, ...updates } : session
          );
          queryClient.setQueryData(queryKey, { sessions: updatedSessions });

          if (
            'durationMinutes' in updates ||
            'startedAt' in updates ||
            'status' in updates
          ) {
            const newStats = calculateFocusStats(updatedSessions);
            queryClient.setQueryData<{ stats: typeof newStats }>(
              FOCUS_QUERY_KEYS.stats,
              { stats: newStats }
            );
          }
        }
      });

      const previousActiveSession = activeSessionData;
      const previousStats = queryClient.getQueryData(FOCUS_QUERY_KEYS.stats);

      return {
        previousSessionData,
        previousActiveSession,
        previousStats,
        snapshots: [],
      };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousActiveSession) {
        queryClient.setQueryData(
          FOCUS_QUERY_KEYS.activeSession,
          context.previousActiveSession
        );
      }
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
