import { DASHBOARD_QUERY_KEYS } from '@/app/(protected)/(main)/dashboard/hooks/dashboard-query-keys';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { HABITS_QUERY_KEYS } from '../habit-query-keys';
import type { Habit } from '../types';

export function useUpdateHabit() {
  return useApiMutation(api.habits[':id'].$patch, {
    optimisticUpdate: {
      queryKey: HABITS_QUERY_KEYS.list,
      updater: (oldData: unknown, variables) => {
        const habits = oldData as Habit[];
        return habits.map((habit) =>
          habit.id === variables.param.id
            ? { ...habit, ...variables.json }
            : habit
        );
      },
    },
    invalidateKeys: [HABITS_QUERY_KEYS.list, DASHBOARD_QUERY_KEYS.metrics],
  });
}
