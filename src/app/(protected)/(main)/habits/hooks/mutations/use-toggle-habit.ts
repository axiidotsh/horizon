import { DASHBOARD_QUERY_KEYS } from '@/app/(protected)/(main)/dashboard/hooks/dashboard-query-keys';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { calculateHabitStats } from '../../utils/habit-calculations';
import { HABITS_QUERY_KEYS } from '../habit-query-keys';
import type { Habit, HabitStats } from '../types';

function toggleHabitCompletion(habits: Habit[], habitId: string, date: Date) {
  return habits.map((habit) => {
    if (habit.id !== habitId) return habit;

    const completions = habit.completions || [];
    const dateKey = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );

    const existingIndex = completions.findIndex((c) => {
      const compDate = new Date(c.date);
      return compDate.getTime() === dateKey.getTime();
    });

    if (existingIndex >= 0) {
      return {
        ...habit,
        completions: completions.filter((_, i) => i !== existingIndex),
      };
    }

    return {
      ...habit,
      completions: [...completions, { date: dateKey.toISOString() }],
    };
  });
}

export function useToggleHabit(habitId?: string) {
  const queryClient = useQueryClient();

  const invalidateKeys: QueryKey[] = [
    HABITS_QUERY_KEYS.list,
    HABITS_QUERY_KEYS.stats,
    DASHBOARD_QUERY_KEYS.metrics,
    DASHBOARD_QUERY_KEYS.heatmap,
    DASHBOARD_QUERY_KEYS.habitChart,
  ];

  const updateAllHabitQueries = (updatedHabits: Habit[]) => {
    const queries = queryClient.getQueriesData({
      queryKey: HABITS_QUERY_KEYS.list,
    });

    queries.forEach(([queryKey]) => {
      queryClient.setQueryData(queryKey, { habits: updatedHabits });
    });

    const newStats = calculateHabitStats(updatedHabits);
    queryClient.setQueryData<{ stats: HabitStats }>(HABITS_QUERY_KEYS.stats, {
      stats: newStats,
    });
  };

  const createOptimisticUpdate = (getDate: (variables?: unknown) => Date) => {
    return {
      onMutate: async (variables?: unknown) => {
        const queries = queryClient.getQueriesData<{ habits: Habit[] }>({
          queryKey: HABITS_QUERY_KEYS.list,
        });

        const previousData = queries.map(([queryKey, data]) => ({
          queryKey,
          data,
        }));

        if (queries.length > 0 && queries[0][1]) {
          const data = queries[0][1];
          const date = getDate(variables);
          const updatedHabits = toggleHabitCompletion(
            data.habits,
            habitId!,
            date
          );
          updateAllHabitQueries(updatedHabits);
        }

        const previousStats = queryClient.getQueryData(HABITS_QUERY_KEYS.stats);
        return { previousData, previousStats, snapshots: [] };
      },
      onError: (
        _error: Error,
        _variables: unknown,
        context?: {
          previousData?: Array<{ queryKey: QueryKey; data: unknown }>;
          previousStats?: unknown;
          snapshots: Array<{ queryKey: QueryKey; data: unknown }>;
        }
      ) => {
        if (context?.previousData) {
          context.previousData.forEach(({ queryKey, data }) => {
            queryClient.setQueryData(queryKey, data);
          });
        }
        if (context?.previousStats) {
          queryClient.setQueryData(
            HABITS_QUERY_KEYS.stats,
            context.previousStats
          );
        }
      },
    };
  };

  const toggleToday = useApiMutation(api.habits[':id'].toggle.$post, {
    mutationKey: habitId ? ['toggleHabit', habitId, 'today'] : undefined,
    invalidateKeys,
    errorMessage: 'Failed to toggle habit',
    ...createOptimisticUpdate(() => new Date()),
  });

  const toggleDate = useApiMutation(api.habits[':id']['toggle-date'].$post, {
    mutationKey: habitId ? ['toggleHabit', habitId, 'date'] : undefined,
    invalidateKeys,
    errorMessage: 'Failed to toggle habit',
    ...createOptimisticUpdate((variables) => {
      const json = (variables as { json: { date: string } }).json;
      return new Date(json.date);
    }),
  });

  return {
    toggleToday,
    toggleDate,
  };
}
