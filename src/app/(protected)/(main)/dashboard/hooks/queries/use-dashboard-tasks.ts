import { useApiQuery } from '@/hooks/use-api-query';
import { api } from '@/lib/rpc';
import { DASHBOARD_QUERY_KEYS } from '../dashboard-query-keys';

export function useDashboardTasks() {
  return useApiQuery(api.dashboard.tasks.$get, {
    queryKey: DASHBOARD_QUERY_KEYS.dashboardTasks,
    select: (data) => data.tasks,
    errorMessage: 'Failed to fetch dashboard tasks',
  });
}
