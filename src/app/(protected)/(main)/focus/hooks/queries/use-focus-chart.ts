import { useApiQuery } from '@/hooks/use-api-query';
import { api } from '@/lib/rpc';
import { FOCUS_QUERY_KEYS } from '../focus-query-keys';

export function useFocusChart(days = 7) {
  return useApiQuery(api.focus.chart.$get, {
    queryKey: [...FOCUS_QUERY_KEYS.chart, days],
    input: {
      query: { days: days.toString() },
    },
    select: (data) => data.chartData,
    errorMessage: 'Failed to fetch chart data',
  });
}
