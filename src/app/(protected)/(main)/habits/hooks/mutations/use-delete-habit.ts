import { DASHBOARD_QUERY_KEYS } from '@/app/(protected)/(main)/dashboard/hooks/dashboard-query-keys';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { useQueryClient } from '@tanstack/react-query';
import { HABITS_QUERY_KEYS } from '../habit-query-keys';
import type { Habit } from '../types';

export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useApiMutation(api.habits[':id'].$delete, {
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: HABITS_QUERY_KEYS.list });

      const previousData = queryClient.getQueryData(HABITS_QUERY_KEYS.list);

      queryClient.setQueryData(HABITS_QUERY_KEYS.list, (old: unknown) => {
        const habits = old as Habit[];
        return habits.filter((habit) => habit.id !== variables.param.id);
      });

      return { previousData, snapshots: [] };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(HABITS_QUERY_KEYS.list, context.previousData);
      }
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
