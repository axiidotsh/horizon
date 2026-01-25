import { useApiQuery } from '@/hooks/use-api-query';
import { api } from '@/lib/rpc';
import { DASHBOARD_QUERY_KEYS } from '../dashboard-query-keys';

export function useDashboardHabits() {
  return useApiQuery(api.dashboard.habits.$get, {
    queryKey: [...DASHBOARD_QUERY_KEYS.dashboardHabits],
    select: (data) => data.habits,
    errorMessage: 'Failed to fetch dashboard habits',
  });
}
