import { DASHBOARD_QUERY_KEYS } from '@/app/(protected)/(main)/dashboard/hooks/dashboard-query-keys';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { HABITS_QUERY_KEYS } from '../habit-query-keys';
import type { Habit } from '../types';

export function useToggleHabit() {
  const toggleToday = useApiMutation(api.habits[':id'].toggle.$post, {
    optimisticUpdate: {
      queryKey: HABITS_QUERY_KEYS.list,
      updater: (oldData: unknown, variables) => {
        const habits = oldData as Habit[];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        return habits.map((habit) => {
          if (habit.id !== variables.param.id) return habit;

          const hasCompletionToday = habit.completions.some((c) => {
            const completionDate = new Date(c.date);
            completionDate.setHours(0, 0, 0, 0);
            return completionDate.toISOString() === todayISO;
          });

          return {
            ...habit,
            completions: hasCompletionToday
              ? habit.completions.filter((c) => {
                  const completionDate = new Date(c.date);
                  completionDate.setHours(0, 0, 0, 0);
                  return completionDate.toISOString() !== todayISO;
                })
              : [...habit.completions, { date: today }],
          };
        });
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

  const toggleDate = useApiMutation(api.habits[':id']['toggle-date'].$post, {
    optimisticUpdate: {
      queryKey: HABITS_QUERY_KEYS.list,
      updater: (oldData: unknown, variables) => {
        const habits = oldData as Habit[];
        const targetDate = new Date(variables.json.date);
        targetDate.setHours(0, 0, 0, 0);
        const targetDateISO = targetDate.toISOString();

        return habits.map((habit) => {
          if (habit.id !== variables.param.id) return habit;

          const hasCompletion = habit.completions.some((c) => {
            const completionDate = new Date(c.date);
            completionDate.setHours(0, 0, 0, 0);
            return completionDate.toISOString() === targetDateISO;
          });

          return {
            ...habit,
            completions: hasCompletion
              ? habit.completions.filter((c) => {
                  const completionDate = new Date(c.date);
                  completionDate.setHours(0, 0, 0, 0);
                  return completionDate.toISOString() !== targetDateISO;
                })
              : [...habit.completions, { date: targetDate }],
          };
        });
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

  return {
    toggleToday,
    toggleDate,
  };
}
