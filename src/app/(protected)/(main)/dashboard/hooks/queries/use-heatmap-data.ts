import { useApiQuery } from '@/hooks/use-api-query';
import { api } from '@/lib/rpc';
import { DASHBOARD_QUERY_KEYS } from '../dashboard-query-keys';

export function useHeatmapData(weeks = 52) {
  return useApiQuery(api.dashboard.heatmap.$get, {
    queryKey: [...DASHBOARD_QUERY_KEYS.heatmap, weeks],
    input: { query: { weeks: weeks.toString() } },
    select: (data) => data.heatmap,
    errorMessage: 'Failed to fetch heatmap data',
  });
}
