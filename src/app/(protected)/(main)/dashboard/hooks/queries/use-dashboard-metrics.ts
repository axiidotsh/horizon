import { useApiQuery } from '@/hooks/use-api-query';
import { api } from '@/lib/rpc';
import { DASHBOARD_QUERY_KEYS } from '../dashboard-query-keys';

export function useDashboardMetrics() {
  return useApiQuery(api.dashboard.metrics.$get, {
    queryKey: DASHBOARD_QUERY_KEYS.metrics,
    select: (data) => data.metrics,
    errorMessage: 'Failed to fetch dashboard metrics',
  });
}
