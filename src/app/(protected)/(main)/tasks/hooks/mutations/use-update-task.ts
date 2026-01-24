import { DASHBOARD_QUERY_KEYS } from '@/app/(protected)/(main)/dashboard/hooks/dashboard-query-keys';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { TASK_QUERY_KEYS } from '../task-query-keys';

export function useUpdateTask() {
  return useApiMutation(api.tasks[':id'].$patch, {
    invalidateKeys: [
      TASK_QUERY_KEYS.all,
      DASHBOARD_QUERY_KEYS.metrics,
      DASHBOARD_QUERY_KEYS.heatmap,
    ],
    errorMessage: 'Failed to update task',
    successMessage: 'Task updated',
  });
}
