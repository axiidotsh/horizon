import { DASHBOARD_QUERY_KEYS } from '@/app/(protected)/(main)/dashboard/hooks/dashboard-query-keys';
import { TRASH_QUERY_KEYS } from '@/app/(protected)/(main)/trash/hooks/trash-query-keys';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { TASK_QUERY_KEYS } from '../task-query-keys';

export function useDeleteTask() {
  return useApiMutation(api.tasks[':id'].$delete, {
    invalidateKeys: [
      TASK_QUERY_KEYS.all,
      DASHBOARD_QUERY_KEYS.metrics,
      DASHBOARD_QUERY_KEYS.heatmap,
      DASHBOARD_QUERY_KEYS.dashboardTasks,
      TRASH_QUERY_KEYS.counts,
      TRASH_QUERY_KEYS.tasks,
    ],
    errorMessage: 'Failed to delete task',
    successMessage: 'Task moved to trash',
    successAction: {
      label: 'Undo',
      onClick: (_data, variables) =>
        api.trash.tasks[':id'].restore.$post({
          param: { id: variables.param.id },
        }),
    },
  });
}
