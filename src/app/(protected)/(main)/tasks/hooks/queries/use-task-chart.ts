import { useApiQuery } from '@/hooks/use-api-query';
import { api } from '@/lib/rpc';
import { TASK_QUERY_KEYS } from '../task-query-keys';

export function useTaskChart(days: number = 7) {
  return useApiQuery(
    () => api.tasks.chart.$get({ query: { days: days.toString() } }),
    {
      queryKey: TASK_QUERY_KEYS.chartWithDays(days),
      select: (data) => data.chartData,
      errorMessage: 'Failed to fetch chart data',
    }
  );
}
