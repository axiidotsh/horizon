import { DASHBOARD_QUERY_KEYS } from '@/app/(protected)/(main)/dashboard/hooks/dashboard-query-keys';
import { useApiMutation } from '@/hooks/use-api-mutation';
import { api } from '@/lib/rpc';
import { TASK_QUERY_KEYS } from '../task-query-keys';
import type { Task } from '../types';

export function useUpdateTask() {
  return useApiMutation(api.tasks[':id'].$patch, {
    optimisticUpdate: {
      queryKey: TASK_QUERY_KEYS.tasks,
      updater: (oldData: unknown, variables) => {
        const data = oldData as { tasks: Task[] };
        return {
          ...data,
          tasks: data.tasks.map((task) =>
            task.id === variables.param.id
              ? { ...task, ...variables.json }
              : task
          ),
        };
      },
    },
    invalidateKeys: [
      TASK_QUERY_KEYS.tasks,
      TASK_QUERY_KEYS.stats,
      TASK_QUERY_KEYS.chart,
      DASHBOARD_QUERY_KEYS.metrics,
      DASHBOARD_QUERY_KEYS.heatmap,
    ],
  });
}
