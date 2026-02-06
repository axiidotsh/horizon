import { DASHBOARD_QUERY_KEYS } from '@/app/(protected)/(main)/dashboard/hooks/dashboard-query-keys';
import { TRASH_QUERY_KEYS } from '@/app/(protected)/(main)/trash/hooks/trash-query-keys';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { HABITS_QUERY_KEYS } from '../habit-query-keys';

export function useDeleteHabit() {
  return useApiMutation(api.habits[':id'].$delete, {
    invalidateKeys: [
      HABITS_QUERY_KEYS.list,
      HABITS_QUERY_KEYS.stats,
      DASHBOARD_QUERY_KEYS.metrics,
      DASHBOARD_QUERY_KEYS.heatmap,
      DASHBOARD_QUERY_KEYS.habitChart,
      DASHBOARD_QUERY_KEYS.dashboardHabits,
      TRASH_QUERY_KEYS.counts,
      TRASH_QUERY_KEYS.habits,
    ],
    errorMessage: 'Failed to delete habit',
    successMessage: 'Habit moved to trash',
    successAction: {
      label: 'Undo',
      onClick: (_data, variables) =>
        api.trash.habits[':id'].restore.$post({
          param: { id: variables.param.id },
        }),
    },
  });
}
