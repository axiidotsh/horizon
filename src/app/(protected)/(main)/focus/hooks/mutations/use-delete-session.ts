import { DASHBOARD_QUERY_KEYS } from '@/app/(protected)/(main)/dashboard/hooks/dashboard-query-keys';
import { TRASH_QUERY_KEYS } from '@/app/(protected)/(main)/trash/hooks/trash-query-keys';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { FOCUS_QUERY_KEYS } from '../focus-query-keys';

export function useDeleteSession() {
  return useApiMutation(api.focus.sessions[':id'].$delete, {
    invalidateKeys: [
      FOCUS_QUERY_KEYS.sessions,
      FOCUS_QUERY_KEYS.stats,
      FOCUS_QUERY_KEYS.chart,
      DASHBOARD_QUERY_KEYS.metrics,
      DASHBOARD_QUERY_KEYS.heatmap,
      TRASH_QUERY_KEYS.counts,
      TRASH_QUERY_KEYS.sessions,
    ],
    errorMessage: 'Failed to delete focus session',
    successMessage: 'Session moved to trash',
    successAction: {
      label: 'Undo',
      onClick: (_data, variables) =>
        api.trash.sessions[':id'].restore.$post({
          param: { id: variables.param.id },
        }),
    },
  });
}
