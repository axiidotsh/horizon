import { DASHBOARD_QUERY_KEYS } from '@/app/(protected)/(main)/dashboard/hooks/dashboard-query-keys';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { FOCUS_QUERY_KEYS } from '../focus-query-keys';

export function useEditSession() {
  return useApiMutation(api.focus.sessions[':id'].$patch, {
    invalidateKeys: [
      FOCUS_QUERY_KEYS.activeSession,
      FOCUS_QUERY_KEYS.sessions,
      FOCUS_QUERY_KEYS.stats,
      FOCUS_QUERY_KEYS.chart,
      DASHBOARD_QUERY_KEYS.metrics,
      DASHBOARD_QUERY_KEYS.heatmap,
    ],
    errorMessage: 'Failed to edit focus session',
    successMessage: 'Focus session edited',
  });
}
