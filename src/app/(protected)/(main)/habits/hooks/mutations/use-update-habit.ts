import { DASHBOARD_QUERY_KEYS } from '@/app/(protected)/(main)/dashboard/hooks/dashboard-query-keys';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { useQueryClient } from '@tanstack/react-query';
import { HABITS_QUERY_KEYS } from '../habit-query-keys';
import type { Habit } from '../types';

export function useUpdateHabit() {
  const queryClient = useQueryClient();

  return useApiMutation(api.habits[':id'].$patch, {
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: HABITS_QUERY_KEYS.list });

      const previousData = queryClient.getQueryData(HABITS_QUERY_KEYS.list);

      queryClient.setQueryData(HABITS_QUERY_KEYS.list, (old: unknown) => {
        const habits = old as Habit[];
        return habits.map((habit) =>
          habit.id === variables.param.id
            ? { ...habit, ...variables.json }
            : habit
        );
      });

      return { previousData, snapshots: [] };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(HABITS_QUERY_KEYS.list, context.previousData);
      }
    },
    invalidateKeys: [HABITS_QUERY_KEYS.list, DASHBOARD_QUERY_KEYS.metrics],
  });
}
