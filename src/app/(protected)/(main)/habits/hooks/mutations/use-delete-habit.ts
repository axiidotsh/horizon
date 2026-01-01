import { DASHBOARD_QUERY_KEYS } from '@/app/(protected)/(main)/dashboard/hooks/dashboard-query-keys';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { HABITS_QUERY_KEYS } from '../habit-query-keys';
import type { Habit } from '../types';

export function useDeleteHabit() {
  return useApiMutation(api.habits[':id'].$delete, {
    optimisticUpdate: {
      queryKey: HABITS_QUERY_KEYS.list,
      updater: (oldData: unknown, variables) => {
        const habits = oldData as Habit[];
        return habits.filter((habit) => habit.id !== variables.param.id);
      },
    },
    invalidateKeys: [
      HABITS_QUERY_KEYS.list,
      HABITS_QUERY_KEYS.stats,
      DASHBOARD_QUERY_KEYS.metrics,
      DASHBOARD_QUERY_KEYS.heatmap,
      DASHBOARD_QUERY_KEYS.habitChart,
    ],
  });
}
