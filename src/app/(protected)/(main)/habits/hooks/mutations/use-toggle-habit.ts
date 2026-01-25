import { DASHBOARD_QUERY_KEYS } from '@/app/(protected)/(main)/dashboard/hooks/dashboard-query-keys';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import type { QueryKey } from '@tanstack/react-query';
import { HABITS_QUERY_KEYS } from '../habit-query-keys';

export function useToggleHabit(habitId?: string) {
  const invalidateKeys: QueryKey[] = [
    HABITS_QUERY_KEYS.list,
    HABITS_QUERY_KEYS.stats,
    DASHBOARD_QUERY_KEYS.dashboardHabits,
    DASHBOARD_QUERY_KEYS.metrics,
    DASHBOARD_QUERY_KEYS.heatmap,
    DASHBOARD_QUERY_KEYS.habitChart,
  ];

  const toggleToday = useApiMutation(api.habits[':id'].toggle.$post, {
    mutationKey: habitId ? ['toggleHabit', habitId, 'today'] : undefined,
    invalidateKeys,
    errorMessage: 'Failed to toggle habit',
  });

  const toggleDate = useApiMutation(api.habits[':id']['toggle-date'].$post, {
    mutationKey: habitId ? ['toggleHabit', habitId, 'date'] : undefined,
    invalidateKeys,
    errorMessage: 'Failed to toggle habit',
  });

  return {
    toggleToday,
    toggleDate,
  };
}
